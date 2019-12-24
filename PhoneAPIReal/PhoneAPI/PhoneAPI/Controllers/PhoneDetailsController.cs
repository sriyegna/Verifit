using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneAPI.Models;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Rest.Api.V2010.Account.AvailablePhoneNumberCountry;

namespace PhoneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhoneDetailsController : ControllerBase
    {
        private readonly PhoneDetailContext _context;

        public PhoneDetailsController(PhoneDetailContext context)
        {
            _context = context;
        }

        // GET: api/PhoneDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhoneDetail>>> GetPhoneDetails()
        {
            return await _context.PhoneDetails.ToListAsync();
        }

        // GET: api/PhoneDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PhoneDetail>> GetPhoneDetail(string id)
        {
            var phoneDetail = await _context.PhoneDetails.FindAsync(id);

            if (phoneDetail == null)
            {
                return NotFound();
            }

            return phoneDetail;
        }

        // PUT: api/PhoneDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPhoneDetail(string id, PhoneDetail phoneDetail)
        {
            if (id != phoneDetail.PhoneSid)
            {
                return BadRequest();
            }

            _context.Entry(phoneDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhoneDetailExists(id))
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

        // POST: api/PhoneDetails
        [HttpPost]
        public async Task<ActionResult<PhoneDetail>> PostPhoneDetail(PhoneDetail phoneDetail)
        {
            //Get Signalwire number
            TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });

            var localAvailableNumbers = LocalResource.Read("US", inRegion: "WA");

            var firstNumber = localAvailableNumbers.First();
            var incomingPhoneNumber = IncomingPhoneNumberResource.Create(
                phoneNumber: firstNumber.PhoneNumber);

            //Save it to model
            phoneDetail.UserName = "bronze";
            phoneDetail.PhoneNumber = incomingPhoneNumber.PhoneNumber.ToString();
            Console.WriteLine(phoneDetail.PhoneNumber);
            phoneDetail.PhoneSid = incomingPhoneNumber.Sid;
            DateTime createDate = DateTime.Now;
            DateTime expireDate = createDate.AddDays(30);
            phoneDetail.TimeCreated = (createDate.ToString("s"));
            Console.WriteLine(phoneDetail.TimeCreated);


            _context.PhoneDetails.Add(phoneDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPhoneDetail", new { id = phoneDetail.PhoneSid }, phoneDetail);
        }

        // DELETE: api/PhoneDetails/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<PhoneDetail>> DeletePhoneDetail(string id)
        {
            var phoneDetail = await _context.PhoneDetails.FindAsync(id);
            if (phoneDetail == null)
            {
                return NotFound();
            }

            _context.PhoneDetails.Remove(phoneDetail);
            await _context.SaveChangesAsync();

            return phoneDetail;
        }

        private bool PhoneDetailExists(string id)
        {
            return _context.PhoneDetails.Any(e => e.PhoneSid == id);
        }
    }
}
