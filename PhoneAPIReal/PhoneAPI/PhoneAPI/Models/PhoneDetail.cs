using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PhoneAPI.Models
{
    public class PhoneDetail
    {
        [Column(TypeName = ("nvarchar(256)"))]
        [Required]
        public string UserName { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string PhoneNumber { get; set; }
        [Key]
        [Column(TypeName = ("nvarchar(60)"))]
        [Required]
        public string PhoneSid { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string TimeCreated { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string TimeExpired { get; set; }
    }
}
