using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PhoneAPI.Models
{
    public class ConversationDetail
    {
        [Key]
        public int ConversationId { get; set; }
        [Column(TypeName =("nvarchar(20)"))]
        [Required]
        public string FromPhoneNumber { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string ToPhoneNumber { get; set; }
        [Column(TypeName = ("nvarchar(MAX)"))]
        [Required]
        public string LastMessage { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string LastMessageTime { get; set; }

    }
}
