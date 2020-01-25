using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace VerifitServer.Models
{
    public class ContactDetail
    {
        [Key]
        [Column(TypeName = ("nvarchar(512)"))]
        [Required]
        public string ContactId { get; set; }
        [Column(TypeName = ("nvarchar(256)"))]
        [Required]
        public string UserName { get; set; }
        [Column(TypeName = ("nvarchar(256)"))]
        [Required]
        public string ContactName { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string PhoneNumber { get; set; }
    }
}
