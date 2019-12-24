using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PhoneAPI.Models
{
    public class PhoneDetailContext : DbContext
    {
        public PhoneDetailContext(DbContextOptions<PhoneDetailContext> options):base(options)
        {

        }
        public DbSet<PhoneDetail> PhoneDetails { get; set; }
    }
}
