using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VerifitServer.Models;

namespace PhoneAPI.Models
{
    public class PhoneDetailContext : DbContext
    {
        public PhoneDetailContext(DbContextOptions<PhoneDetailContext> options):base(options)
        {

        }
        public DbSet<PhoneDetail> PhoneDetails { get; set; }
        public DbSet<VerifitServer.Models.MessageDetail> MessageDetail { get; set; }
    }
}
