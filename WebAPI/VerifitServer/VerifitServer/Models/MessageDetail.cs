using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace VerifitServer.Models
{
    public class MessageDetail
    {
        [Key]
        [Column(TypeName = ("nvarchar(50)"))]
        [Required]
        public string MessageSid { get; set; }

        [Column(TypeName = ("nvarchar(MAX)"))]
        [Required]
        public string Body { get; set; }

        [Column(TypeName = ("nvarchar(50)"))]
        [Required]
        public string Time { get; set; }

        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string Direction { get; set; }

        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string FromPhoneNumber { get; set; }

        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string ToPhoneNumber { get; set; }
    }
}
