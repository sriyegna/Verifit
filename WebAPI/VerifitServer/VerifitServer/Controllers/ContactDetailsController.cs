using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VerifitServer.Models;

namespace VerifitServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactDetailsController : ControllerBase
    {
        private readonly ContactDetailContext _context;

        public ContactDetailsController(ContactDetailContext context)
        {
            _context = context;
        }

        // GET: api/ContactDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactDetail>>> GetContactDetails()
        {
            return await _context.ContactDetails.ToListAsync();
        }

        // GET: api/ContactDetails/5
        [HttpGet("GetUserContacts/{username}")]
        public async Task<ActionResult<IEnumerable<ContactDetail>>> GetUserContacts(string username)
        {
            var contactDetail = await _context.ContactDetails.Where(a => a.UserName == username).ToListAsync();

            if (contactDetail == null)
            {
                return NotFound();
            }

            return contactDetail;
        }

        // PUT: api/ContactDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContactDetail(string id, ContactDetail contactDetail)
        {
            if (id != contactDetail.ContactId)
            {
                return BadRequest();
            }

            _context.Entry(contactDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactDetailExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/ContactDetails
        [HttpPost]
        public async Task<ActionResult<ContactDetail>> PostContactDetail(ContactDetail contactDetail)
        {
            _context.ContactDetails.Add(contactDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContactDetail", new { id = contactDetail.ContactId }, contactDetail);
        }

        // POST: api/PhoneDetails
        [HttpPost]
        [Route("ChangeContactName")]
        public async Task<ActionResult<ContactDetail>> ChangeContactName(ContactDetail contact)
        {

            ContactDetail newResult = await _context.ContactDetails.Where(a => a.ContactId == contact.ContactId).FirstAsync();
            newResult.ContactName = contact.ContactName;
            _context.ContactDetails.Update(newResult);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/ContactDetails/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ContactDetail>> DeleteContactDetail(string id)
        {
            var contactDetail = await _context.ContactDetails.FindAsync(id);
            if (contactDetail == null)
            {
                return NotFound();
            }

            _context.ContactDetails.Remove(contactDetail);
            await _context.SaveChangesAsync();

            return contactDetail;
        }

        private bool ContactDetailExists(string id)
        {
            return _context.ContactDetails.Any(e => e.ContactId == id);
        }
    }
}
