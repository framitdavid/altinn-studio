using System.Threading.Tasks;
using Altinn.Studio.Designer.Repository.Models;
using Altinn.Studio.Designer.Services.Models;
using Altinn.Studio.Designer.ViewModels.Request;

namespace Altinn.Studio.Designer.Services.Interfaces
{
    /// <summary>
    /// The interface for business logic service for deployment
    /// </summary>
    public interface IDeploymentService
    {
        /// <summary>
        /// Starts a deployment in the pipeline
        /// Creates a document in document db
        /// </summary>
        /// <param name="org">Organisation</param>
        /// <param name="app">Application name</param>
        /// <param name="deployment">Release containing data from client</param>
        /// <returns>The created document in db</returns>
        Task<DeploymentEntity> CreateAsync(string org, string app, DeploymentModel deployment);

        /// <summary>
        /// Gets deployments
        /// </summary>
        /// <param name="org">Organisation</param>
        /// <param name="app">Application name</param>
        /// <param name="query">DocumentQueryModel</param>
        /// <returns>SearchResults of type DeploymentEntity</returns>
        Task<Deployment> GetAsync(string org, string app, DocumentQueryModel query);

        /// <summary>
        /// Updates a deployment entity
        /// </summary>
        /// <param name="buildNumber">Azure DevOps build number</param>
        /// <param name="appOwner">Application owner.</param>
        Task UpdateAsync(string buildNumber, string appOwner);

    }
}
