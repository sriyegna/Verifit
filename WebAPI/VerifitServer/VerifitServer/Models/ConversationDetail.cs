using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PhoneAPI.Models
{
    public class ConversationDetail
    {
        [Key]
        [Column(TypeName = ("nvarchar(512)"))]
        [Required]
        public string ConversationId { get; set; }
        [Column(TypeName = ("nvarchar(256)"))]
        [Required]
        public string UserName { get; set; }
        [Column(TypeName = ("nvarchar(256)"))]
        [Required]
        public string ConversationName { get; set; }
        [Column(TypeName =("nvarchar(20)"))]
        [Required]
        public string FromPhoneNumber { get; set; }
        [Column(TypeName = ("nvarchar(20)"))]
        [Required]
        public string ToPhoneNumber { get; set; }
        [Column(TypeName = ("nvarchar(MAX)"))]
        [Required]
        public string LastMessage { get; set; }
        [Column(TypeName = ("nvarchar(50)"))]
        [Required]
        public string LastMessageTime { get; set; }
        
    }
}
