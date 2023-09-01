using System.Runtime.Serialization;

namespace Altinn.Studio.Designer.Enums
{
    public enum ResourcePartyType
    {
        [EnumMember(Value = "Default")]
        Default = 0,

        [EnumMember(Value = "PrivatePerson")]
        PrivatePerson = 1,

        [EnumMember(Value = "LegalEntityEnterprise")]
        LegalEntityEnterprise = 2,

        [EnumMember(Value = "Company")]
        Company = 3,

        [EnumMember(Value = "BankruptcyEstate")]
        BankruptcyEstate = 4,

        [EnumMember(Value = "SelfRegisteredUser")]
        SelfRegisteredUser = 5
    }
}
