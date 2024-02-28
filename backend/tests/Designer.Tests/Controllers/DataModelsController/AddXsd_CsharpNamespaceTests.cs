﻿using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Altinn.App.Core.Models;
using Designer.Tests.Controllers.ApiTests;
using Designer.Tests.Utils;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using SharedResources.Tests;
using Xunit;

namespace Designer.Tests.Controllers.DataModelsController;

public class AddXsd_CsharpNamespaceTests : DisagnerEndpointsTestsBase<AddXsd_CsharpNamespaceTests>, IClassFixture<WebApplicationFactory<Program>>
{
    private static string VersionPrefix(string org, string repository) => $"/designer/api/{org}/{repository}/datamodels";

    public AddXsd_CsharpNamespaceTests(WebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Theory]
    [InlineData("Model/XmlSchema/Gitea/aal-vedlegg.xsd", "ttd", "empty-app", "testUser", "App/models/aal-vedlegg.cs", "Altinn.App.Models.vedlegg", "vedlegg", "Altinn.App.Models")]
    [InlineData("Kursdomene_HvemErHvem_M_2021-04-08_5742_34627_SERES.xsd", "ttd", "hvem-er-hvem", "testUser", "App/models/Kursdomene_HvemErHvem_M_2021-04-08_5742_34627_SERES.cs", "Altinn.App.Models", "HvemErHvem_M", "Altinn.App.Models.HvemErHvem_M")]
    public async Task GivenApp_ShouldProduce_CorrectNamespace(string xsdPath, string org, string repo, string developer, string expectedModelPath, string expectedNamespace, string expectedTypeName, string notExpectedNamespace)
    {
        string targetRepository = TestDataHelper.GenerateTestRepoName();
        await CopyRepositoryForTest(org, repo, developer, targetRepository);
        string url = $"{VersionPrefix(org, targetRepository)}/upload";

        var fileStream = SharedResourcesHelper.LoadTestData(xsdPath);
        var formData = new MultipartFormDataContent();
        var streamContent = new StreamContent(fileStream);
        streamContent.Headers.ContentType = MediaTypeHeaderValue.Parse("multipart/form-data");
        formData.Add(streamContent, "file", Path.GetFileName(xsdPath));

        using var response = await HttpClient.PostAsync(url, formData);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        // get the csharp model from repo
        string csharpModel = TestDataHelper.GetFileFromRepo(org, targetRepository, developer, expectedModelPath);
        csharpModel.Should().Contain($"namespace {expectedNamespace}\n{{");

        string applicationMetadataContent = TestDataHelper.GetFileFromRepo(org, targetRepository, developer, "App/config/applicationmetadata.json");
        var applicationMetadata = JsonSerializer.Deserialize<ApplicationMetadata>(applicationMetadataContent, JsonSerializerOptions);

        applicationMetadata.DataTypes.Should().Contain(x => x.AppLogic != null && x.AppLogic.ClassRef ==
                                                            $"{expectedNamespace}.{expectedTypeName}");

        applicationMetadata.DataTypes.Should().NotContain(x => x.AppLogic != null && x.AppLogic.ClassRef ==
            $"{notExpectedNamespace}.{expectedTypeName}");
    }
}
