﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Altinn.Authorization.ABAC.Xacml;
using Altinn.ResourceRegistry.Core.Enums.Altinn2;
using Altinn.ResourceRegistry.Core.Models.Altinn2;
using Altinn.Studio.Designer.Configuration;
using Altinn.Studio.Designer.Helpers;
using Altinn.Studio.Designer.Models;
using Altinn.Studio.Designer.Services.Interfaces;
using Altinn.Studio.Designer.TypedHttpClients.Altinn2Metadata;
using Altinn.Studio.Designer.TypedHttpClients.ResourceRegistryOptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using RepositoryModel = Altinn.Studio.Designer.RepositoryClient.Model.Repository;

namespace Altinn.Studio.Designer.Controllers
{
    [Authorize]
    //[AutoValidateAntiforgeryToken]
    public class ResourceAdminController : ControllerBase
    {
        private readonly IGitea _giteaApi;
        private readonly IRepository _repository;
        private readonly IResourceRegistryOptions _resourceRegistryOptions;
        private readonly IMemoryCache _memoryCache;
        private readonly CacheSettings _cacheSettings;
        private readonly IAltinn2MetadataClient _altinn2MetadataClient;

        public ResourceAdminController(IGitea gitea, IRepository repository, IResourceRegistryOptions resourceRegistryOptions, IMemoryCache memoryCache, IOptions<CacheSettings> cacheSettings, IAltinn2MetadataClient altinn2MetadataClient)
        {
            _giteaApi = gitea;
            _repository = repository;
            _resourceRegistryOptions = resourceRegistryOptions;
            _memoryCache = memoryCache;
            _cacheSettings = cacheSettings.Value;
            _altinn2MetadataClient = altinn2MetadataClient;
        }

        [HttpGet]
        [Route("designer/api/{org}/resources")]
        public async Task<ActionResult<RepositoryModel>> GetRepository(string org)
        {
            IList<RepositoryModel> repositories = await _giteaApi.GetOrgRepos(org);

            foreach (RepositoryModel repo in repositories)
            {
                if (repo.FullName.ToLower().Contains("resources"))
                {
                    return repo;
                }
            }

            return StatusCode(204);
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/resourcelist")]
        public async Task<ActionResult<List<ListviewServiceResource>>> GetRepositoryResourceList(string org)
        {
            string repository = string.Format("{0}-resources", org);
            List<ServiceResource> repositoryResourceList = _repository.GetServiceResources(org, repository);
            List<ListviewServiceResource> listviewServiceResources = new List<ListviewServiceResource>();

            foreach (ServiceResource resource in repositoryResourceList)
            {
                ListviewServiceResource listviewResource = await _giteaApi.MapServiceResourceToListViewResource(org, string.Format("{0}-resources", org), resource);
                listviewResource.HasPolicy = _repository.ResourceHasPolicy(org, repository, resource);
                listviewResource = _repository.AddLastChangedAndCreatedByIfMissingFromGitea(listviewResource);
                listviewServiceResources.Add(listviewResource);
            }

            return listviewServiceResources != null && listviewServiceResources.Count > 0 ? listviewServiceResources : StatusCode(204);
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/{repository}")]
        [Route("designer/api/{org}/resources/{repository}/{id}")]
        public ActionResult<ServiceResource> GetResourceById(string org, string repository, string id = "")
        {
            if (id != "")
            {
                ServiceResource resource = _repository.GetServiceResourceById(org, repository, id);
                return resource != null ? resource : StatusCode(204);
            }
            else
            {
                List<ServiceResource> repositoryResourceList = _repository.GetServiceResources(org, repository);
                return repositoryResourceList != null ? repositoryResourceList.First() : StatusCode(204);
            }
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/publishstatus/{repository}/{id}")]
        public ActionResult<ServiceResourceStatus> GetPublishStatusById(string org, string repository, string id = "")
        {
            ServiceResourceStatus resourceStatus = new ServiceResourceStatus();
            ServiceResource resource = _repository.GetServiceResourceById(org, repository, id);
            if (resource == null)
            {
                return StatusCode(204);
            }

            resourceStatus.ResourceVersion = resource.Version;

            // Todo. Temp test values until we have integration with resource registry in place
            resourceStatus.PublishedVersions = new List<ResourceVersionInfo>();
            resourceStatus.PublishedVersions.Add(new ResourceVersionInfo() { Environment = "TT02", Version = "2024.2" });
            resourceStatus.PublishedVersions.Add(new ResourceVersionInfo() { Environment = "PROD", Version = "2024.1" });

            return resourceStatus;
        }

        [Route("designer/api/{org}/resources/validate/{repository}")]
        [Route("designer/api/{org}/resources/validate/{repository}/{id}")]
        public ActionResult GetValidateResource(string org, string repository, string id = "")
        {
            ValidationProblemDetails validationProblemDetails = new ValidationProblemDetails();
            ServiceResource resourceToValidate;

            if (id != "")
            {
                resourceToValidate = _repository.GetServiceResourceById(org, repository, id);
                if (resourceToValidate != null)
                {
                    validationProblemDetails = ValidateResource(resourceToValidate);
                }
            }
            else
            {
                List<ServiceResource> repositoryResourceList = _repository.GetServiceResources(org, repository);
                resourceToValidate = repositoryResourceList.FirstOrDefault();
                if (repositoryResourceList.Count > 0)
                {
                    validationProblemDetails = ValidateResource(resourceToValidate);
                }
            }

            if (resourceToValidate != null)
            {
                if (validationProblemDetails.Errors.Count == 0)
                {
                    validationProblemDetails.Status = 200;
                    validationProblemDetails.Title = "No validation errors occurred.";
                }

                return Ok(validationProblemDetails);
            }
            else
            {
                return StatusCode(400);
            }
        }

        [HttpPut]
        [Route("designer/api/{org}/resources/updateresource/{id}")]
        public ActionResult UpdateResource(string org, string id, [FromBody] ServiceResource resource)
        {
            return _repository.UpdateServiceResource(org, id, resource);
        }

        [HttpPost]
        [Route("designer/api/{org}/resources/addresource")]
        public ActionResult<ServiceResource> AddResource(string org, [FromBody] ServiceResource resource)
        {
            return _repository.AddServiceResource(org, resource);
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/importresource/{serviceCode}/{serviceEdition}/{environment}")]
        public async Task<ActionResult> ImportResource(string org, string serviceCode, int serviceEdition, string environment)
        {
            string repository = string.Format("{0}-resources", org);
            ServiceResource resource = await _altinn2MetadataClient.GetServiceResourceFromService(serviceCode, serviceEdition, environment);
            _repository.AddServiceResource(org, resource);
            XacmlPolicy policy = await _altinn2MetadataClient.GetXacmlPolicy(serviceCode, serviceEdition, resource.Identifier, environment);
            await _repository.SavePolicy(org, repository, resource.Identifier, policy);
            return Ok(resource);
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/sectors")]
        public async Task<ActionResult<List<DataTheme>>> GetSectors()
        {
            string cacheKey = "sectors";
            if (!_memoryCache.TryGetValue(cacheKey, out List<DataTheme> sectors))
            {
                DataThemesContainer dataThemesContainer = await _resourceRegistryOptions.GetSectors();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
               .SetPriority(CacheItemPriority.High)
               .SetAbsoluteExpiration(new TimeSpan(0, _cacheSettings.DataNorgeApiCacheTimeout, 0));

                sectors = dataThemesContainer.DataThemes;

                _memoryCache.Set(cacheKey, sectors, cacheEntryOptions);
            }

            return sectors;
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/losterms")]
        public async Task<ActionResult<List<LosTerm>>> GetGetLosTerms()
        {
            string cacheKey = "losterms";
            if (!_memoryCache.TryGetValue(cacheKey, out List<LosTerm> sectors))
            {
                LosTerms losTerms = await _resourceRegistryOptions.GetLosTerms();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
               .SetPriority(CacheItemPriority.High)
               .SetAbsoluteExpiration(new TimeSpan(0, _cacheSettings.DataNorgeApiCacheTimeout, 0));

                sectors = losTerms.LosNodes;

                _memoryCache.Set(cacheKey, sectors, cacheEntryOptions);
            }

            return sectors;
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/eurovoc")]
        public async Task<ActionResult<List<EuroVocTerm>>> GetEuroVoc()
        {
            string cacheKey = "eurovocs";
            if (!_memoryCache.TryGetValue(cacheKey, out List<EuroVocTerm> sectors))
            {

                EuroVocTerms euroVocTerms = await _resourceRegistryOptions.GetEuroVocTerms();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
               .SetPriority(CacheItemPriority.High)
               .SetAbsoluteExpiration(new TimeSpan(0, _cacheSettings.DataNorgeApiCacheTimeout, 0));

                sectors = euroVocTerms.EuroVocs;
                _memoryCache.Set(cacheKey, sectors, cacheEntryOptions);
            }

            return sectors;
        }

        [HttpGet]
        [Route("designer/api/{org}/resources/altinn2linkservices/{environment}")]
        public async Task<ActionResult<List<AvailableService>>> GetAltinn2LinkServices(string org, string enviroment)
        {
            string cacheKey = "availablelinkservices:" + org;
            if (!_memoryCache.TryGetValue(cacheKey, out List<AvailableService> linkServices))
            {

                List<AvailableService> unfiltered = await _altinn2MetadataClient.AvailableServices(1044, enviroment);

                var cacheEntryOptions = new MemoryCacheEntryOptions()
               .SetPriority(CacheItemPriority.High)
               .SetAbsoluteExpiration(new TimeSpan(0, _cacheSettings.DataNorgeApiCacheTimeout, 0));

                linkServices = unfiltered.Where(a => a.ServiceType.Equals(ServiceType.Link) && a.ServiceOwnerCode.ToLower().Equals(org.ToLower())).ToList();
                _memoryCache.Set(cacheKey, linkServices, cacheEntryOptions);
            }

            return linkServices;
        }


        private ValidationProblemDetails ValidateResource(ServiceResource resource, bool strictMode = false)
        {
            if (!ResourceAdminHelper.ValidDictionaryAttribute(resource.Title))
            {
                ModelState.AddModelError($"{resource.Identifier}.title", "resourceerror.missingtitle");
            }

            if (!ResourceAdminHelper.ValidDictionaryAttribute(resource.Description))
            {
                ModelState.AddModelError($"{resource.Identifier}.description", "resourceerror.missingdescription");
            }

            if (resource.ResourceType == null)
            {
                ModelState.AddModelError($"{resource.Identifier}.resourcetype", "resourceerror.missingresourcetype");
            }

            if (!ResourceAdminHelper.ValidDictionaryAttribute(resource.RightDescription))
            {
                ModelState.AddModelError($"{resource.Identifier}.rightDescription", "resourceerror.missingrightdescription");
            }

            if (strictMode && (resource.ThematicArea == null || string.IsNullOrEmpty(resource.ThematicArea)))
            {
                ModelState.AddModelError($"{resource.Identifier}.thematicarea", "resourceerror.missingthematicarea");
            }

            ValidationProblemDetails details = ProblemDetailsFactory.CreateValidationProblemDetails(HttpContext, ModelState);

            return details;
        }
    }
}
