using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneAPI.Models;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using VerifitServer.Models;

namespace VerifitServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConversationDetailsController : ControllerBase
    {
        private readonly ConversationDetailContext _context;
        private readonly MessageDetailContext _messageContext;

        public ConversationDetailsController(ConversationDetailContext context, MessageDetailContext messageContext)
        {
            _context = context;
            _messageContext = messageContext;
        }

        // GET: api/ConversationDetails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConversationDetail>>> GetConversationDetails()
        {
            return await _context.ConversationDetails.ToListAsync();
        }

        // GET: api/ConversationDetails/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConversationDetail>> GetConversationDetail(int id)
        {
            var conversationDetail = await _context.ConversationDetails.FindAsync(id);

            if (conversationDetail == null)
            {
                return NotFound();
            }

            return conversationDetail;
        }

        [HttpGet("GetUserConversations/{username}&{fromPhoneNumber}")]
        public async Task<ActionResult<IEnumerable<ConversationDetail>>> GetUserConversations(string username, string fromPhoneNumber)
        {
            var phoneNumber = "+" + fromPhoneNumber;
            var conversationDetail = await _context.ConversationDetails.Where(a => (a.FromPhoneNumber == phoneNumber)).OrderByDescending(a => a.LastMessageTime).OrderByDescending(a => DateTime.Parse(a.LastMessageTime)).ToListAsync();

            if (conversationDetail == null)
            {
                return NotFound();
            }

            return conversationDetail;
        }

        // PUT: api/ConversationDetails/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutConversationDetail(string id, ConversationDetail conversationDetail)
        {
            if (id != conversationDetail.ConversationId)
            {
                return BadRequest();
            }

            _context.Entry(conversationDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConversationDetailExists(id))
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

        // POST: api/ConversationDetails
        [HttpPost]
        public async Task<ActionResult<ConversationDetail>> PostConversationDetail(ConversationDetail conversationDetail)
        {
            _context.ConversationDetails.Add(conversationDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetConversationDetail", new { id = conversationDetail.ConversationId }, conversationDetail);
        }

        [HttpPost]
        [Route("DeleteConversation")]
        public async Task<ActionResult<ConversationDetail>> DeleteConversation(ConversationDetail conversation)
        {
            ConversationDetail conversationDetail = await _context.ConversationDetails.FindAsync(conversation.ConversationId);

            if (conversationDetail == null)
            {
                return NotFound();
            }

            //Delete all pertinent messages
            Debug.WriteLine(conversationDetail.FromPhoneNumber);
            Debug.WriteLine(conversationDetail.ToPhoneNumber);
            var messageDetails = await _messageContext.MessageDetails.Where(a =>
            (((a.FromPhoneNumber == conversationDetail.FromPhoneNumber) && (a.ToPhoneNumber == conversationDetail.ToPhoneNumber) && (a.Direction == "outbound-api")) ||
            ((a.FromPhoneNumber == conversationDetail.ToPhoneNumber) && (a.ToPhoneNumber == conversationDetail.FromPhoneNumber) && (a.Direction == "inbound")))
            ).ToListAsync();

            foreach (MessageDetail message in messageDetails)
            {
                _messageContext.MessageDetails.Remove(message);
            }
            await _messageContext.SaveChangesAsync();
            //End Delete all pertinent messages


            _context.ConversationDetails.Remove(conversationDetail);
            await _context.SaveChangesAsync();

            return conversationDetail;
        }

        [HttpPost]
        [Route("RenameConversation")]
        public async Task<ActionResult<ConversationDetail>> RenameConversation(ConversationDetail conversation)
        {
            ConversationDetail conversationDetail = await _context.ConversationDetails.FindAsync(conversation.ConversationId);
            conversationDetail.ConversationName = conversation.ConversationName;

            if (conversationDetail == null)
            {
                return NotFound();
            }

           _context.ConversationDetails.Update(conversationDetail);
            await _context.SaveChangesAsync();

            return conversationDetail;
        }

        // DELETE: api/ConversationDetails/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ConversationDetail>> DeleteConversationDetail(int id)
        {
            var conversationDetail = await _context.ConversationDetails.FindAsync(id);
            if (conversationDetail == null)
            {
                return NotFound();
            }

            _context.ConversationDetails.Remove(conversationDetail);
            await _context.SaveChangesAsync();

            return conversationDetail;
        }

        private bool ConversationDetailExists(string id)
        {
            return _context.ConversationDetails.Any(e => e.ConversationId == id);
        }
    }
}
