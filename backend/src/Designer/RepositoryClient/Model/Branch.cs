/*
 * Gitea API.
 *
 * This documentation describes the Gitea API.
 *
 * OpenAPI spec version: 1.1.1
 *
 * Generated by: https://github.com/swagger-api/swagger-codegen.git
 */

using System.Runtime.Serialization;

namespace Altinn.Studio.Designer.RepositoryClient.Model
{
    /// <summary>
    /// Branch represents a repository branch
    /// </summary>
    [DataContract]
    public partial class Branch
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Branch"/> class.
        /// </summary>
        public Branch()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Branch" /> class.
        /// </summary>
        /// <param name="Commit">Commit.</param>
        /// <param name="Name">Name.</param>
        public Branch(PayloadCommit Commit = default(PayloadCommit), string Name = default(string))
        {
            this.Commit = Commit;
            this.Name = Name;
        }

        /// <summary>
        /// Gets or Sets Commit
        /// </summary>
        [DataMember(Name = "commit", EmitDefaultValue = false)]
        public PayloadCommit Commit { get; set; }

        /// <summary>
        /// Gets or Sets Name
        /// </summary>
        [DataMember(Name = "name", EmitDefaultValue = false)]
        public string Name { get; set; }
    }
}
