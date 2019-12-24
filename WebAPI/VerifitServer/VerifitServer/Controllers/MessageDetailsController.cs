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
    public class MessageDetailsController : ControllerBase
    {
        private readonly MessageDetailContext _context;

        public MessageDetailsController(MessageDetailContext context)
        {
            _context = context;
        }

        public async void AddMessageToDb(string id)
        {
            Console.WriteLine("Add Message Called");
        }

        // GET: api/MessageDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDetail>>> GetMessageDetails()
        {
            return await _context.MessageDetails.ToListAsync();
        }

        // GET: api/MessageDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MessageDetail>> GetMessageDetail(string id)
        {
            var messageDetail = await _context.MessageDetails.FindAsync(id);

            if (messageDetail == null)
            {
                return NotFound();
            }

            return messageDetail;
        }

        // PUT: api/MessageDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMessageDetail(string id, MessageDetail messageDetail)
        {
            if (id != messageDetail.MessageSid)
            {
                return BadRequest();
            }

            _context.Entry(messageDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MessageDetailExists(id))
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

        // POST: api/MessageDetails
        [HttpPost]
        public async Task<ActionResult<MessageDetail>> PostMessageDetail(MessageDetail messageDetail)
        {
            _context.MessageDetails.Add(messageDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMessageDetail", new { id = messageDetail.MessageSid }, messageDetail);
        }

        // DELETE: api/MessageDetails/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<MessageDetail>> DeleteMessageDetail(string id)
        {
            var messageDetail = await _context.MessageDetails.FindAsync(id);
            if (messageDetail == null)
            {
                return NotFound();
            }

            _context.MessageDetails.Remove(messageDetail);
            await _context.SaveChangesAsync();

            return messageDetail;
        }

        private bool MessageDetailExists(string id)
        {
            return _context.MessageDetails.Any(e => e.MessageSid == id);
        }
    }
}
