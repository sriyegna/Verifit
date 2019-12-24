using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VerifitServer.Models
{
    public class MessageDetailContext : DbContext
    {
        public MessageDetailContext(DbContextOptions<MessageDetailContext> options) : base(options)
        {

        }

        public DbSet<MessageDetail> MessageDetails { get; set; }
    }
}
