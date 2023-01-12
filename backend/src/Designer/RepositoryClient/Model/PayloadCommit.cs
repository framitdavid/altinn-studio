/* 
 * Gitea API.
 *
 * This documentation describes the Gitea API.
 *
 * OpenAPI spec version: 1.1.1
 * 
 * Generated by: https://github.com/swagger-api/swagger-codegen.git
 */

using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Altinn.Studio.Designer.RepositoryClient.Model
{
    /// <summary>
    /// PayloadCommit represents a commit
    /// </summary>
    [DataContract]
    public partial class PayloadCommit
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="PayloadCommit"/> class.
        /// </summary>
        public PayloadCommit()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PayloadCommit" /> class.
        /// </summary>
        /// <param name="Author">Author.</param>
        /// <param name="Committer">Committer.</param>
        /// <param name="Id">sha1 hash of the commit.</param>
        /// <param name="Message">Message.</param>
        /// <param name="Timestamp">Timestamp.</param>
        /// <param name="Url">Url.</param>
        /// <param name="Verification">Verification.</param>
        public PayloadCommit(PayloadUser Author = default(PayloadUser), PayloadUser Committer = default(PayloadUser), string Id = default(string), string Message = default(string), string Timestamp = default(string), string Url = default(string), PayloadCommitVerification Verification = default(PayloadCommitVerification))
        {
            this.Author = Author;
            this.Committer = Committer;
            this.Id = Id;
            this.Message = Message;
            this.Timestamp = Timestamp;
            this.Url = Url;
            this.Verification = Verification;
        }

        /// <summary>
        /// Gets or Sets Author
        /// </summary>
        [DataMember(Name = "author", EmitDefaultValue = false)]
        public PayloadUser Author { get; set; }

        /// <summary>
        /// Gets or Sets Committer
        /// </summary>
        [DataMember(Name = "committer", EmitDefaultValue = false)]
        public PayloadUser Committer { get; set; }

        /// <summary>
        /// sha1 hash of the commit
        /// </summary>
        /// <value>sha1 value</value>
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

        /// <summary>
        /// Gets or Sets Message
        /// </summary>
        [DataMember(Name = "message", EmitDefaultValue = false)]
        public string Message { get; set; }

        /// <summary>
        /// Gets or Sets Timestamp
        /// </summary>
        [DataMember(Name = "timestamp", EmitDefaultValue = false)]
        public string Timestamp { get; set; }

        /// <summary>
        /// Gets or Sets Url
        /// </summary>
        [DataMember(Name = "url", EmitDefaultValue = false)]
        public string Url { get; set; }

        /// <summary>
        /// Gets or Sets Verification
        /// </summary>
        [DataMember(Name = "verification", EmitDefaultValue = false)]
        public PayloadCommitVerification Verification { get; set; }
    }
}
