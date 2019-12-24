using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PhoneAPI.Models
{
    public class ConversationDetailContext : DbContext
    {
        public ConversationDetailContext(DbContextOptions<ConversationDetailContext> options) : base(options)
        {

        }

        public DbSet<ConversationDetail> ConversationDetails { get; set; }
    }
}
