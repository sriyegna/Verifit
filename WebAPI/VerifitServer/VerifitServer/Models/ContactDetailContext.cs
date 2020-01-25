using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VerifitServer.Models;

namespace VerifitServer.Models
{
    public class ContactDetailContext : DbContext
    {
        public ContactDetailContext(DbContextOptions<ContactDetailContext> options) : base(options)
        {

        }
        public DbSet<ContactDetail> ContactDetails { get; set; }
    }
}
