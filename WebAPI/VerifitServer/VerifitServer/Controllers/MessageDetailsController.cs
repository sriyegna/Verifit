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
    public class MessageDetailsController : ControllerBase
    {
        private readonly MessageDetailContext _context;
        private readonly ConversationDetailContext _conversationContext;

        public MessageDetailsController(MessageDetailContext context, ConversationDetailContext conversationContext)
        {
            _context = context;
            _conversationContext = conversationContext;
        }

        // GET: api/MessageDetails 
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDetail>>> GetMessageDetails()
        {
            return await _context.MessageDetails.ToListAsync();
        }

        [HttpGet("GetUserConversationMessages/{toPhoneNumber}&{fromPhoneNumber}")]
        public async Task<ActionResult<IEnumerable<MessageDetail>>> GetUserConversationMessages(string toPhoneNumber, string fromPhoneNumber)
        {
            var tophoneNumber = "+" + toPhoneNumber;
            var fromphoneNumber = "+" + fromPhoneNumber;
            var messageDetail = await _context.MessageDetails.Where(a =>  
                (((a.ToPhoneNumber == tophoneNumber) && (a.FromPhoneNumber == fromphoneNumber) && (a.Direction == "outbound-api")) || 
                ((a.FromPhoneNumber == tophoneNumber) && (a.ToPhoneNumber == fromphoneNumber) && (a.Direction == "inbound"))))
                .OrderBy(a => DateTime.Parse(a.Time)).ToListAsync();

            if (messageDetail == null)
            {
                return NotFound();
            }

            return messageDetail;
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

        // POST: api/SendMessage
        [HttpPost]
        [Route("SendMessage")]
        public async Task<ActionResult<MessageDetail>> SendMessage(MessageDetail messageDetail)
        {

            //Get Signalwire number
            TwilioClient.Init("28361e6c-85b8-40f5-bde1-bfc8cf68a96c", "PT65bfa7479efd98c38f525e7c352277e70aff63ef22f4e8be", new Dictionary<string, object> { ["signalwireSpaceUrl"] = "manish.signalwire.com" });

            //Create and send outgoing message
            var message = MessageResource.Create(
                from: new Twilio.Types.PhoneNumber(messageDetail.FromPhoneNumber),
                body: messageDetail.Body,
                to: new Twilio.Types.PhoneNumber(messageDetail.ToPhoneNumber)
            );

            messageDetail.MessageSid = message.Sid;
            messageDetail.Time = DateTime.UtcNow.ToString();
            messageDetail.Direction = (message.Direction).ToString();
                       
            _context.MessageDetails.Add(messageDetail);
            await _context.SaveChangesAsync();

            //Update conversation table
            
            var conversationsToUpdate = await _conversationContext.ConversationDetails.Where(a => ((a.FromPhoneNumber == messageDetail.FromPhoneNumber) && (a.ToPhoneNumber == messageDetail.ToPhoneNumber)) || ((a.FromPhoneNumber == messageDetail.ToPhoneNumber) && (a.ToPhoneNumber == messageDetail.FromPhoneNumber))).ToListAsync();
            if (conversationsToUpdate.Count != 0) { 
                foreach (ConversationDetail convo in conversationsToUpdate)
                {
                    convo.LastMessage = messageDetail.Body;
                    convo.LastMessageTime = messageDetail.Time;
                    _conversationContext.ConversationDetails.Update(convo);
                }
            }
            else
            {
                ConversationDetail convo = new ConversationDetail
                {
                    ConversationId = messageDetail.ToPhoneNumber + messageDetail.FromPhoneNumber,
                    ConversationName = "",
                    FromPhoneNumber = messageDetail.FromPhoneNumber,
                    ToPhoneNumber = messageDetail.ToPhoneNumber,
                    LastMessage = messageDetail.Body,
                    LastMessageTime = messageDetail.Time
                };
                _conversationContext.ConversationDetails.Add(convo);
                convo = new ConversationDetail
                {
                    ConversationId = messageDetail.FromPhoneNumber + messageDetail.ToPhoneNumber,
                    ConversationName = "",
                    FromPhoneNumber = messageDetail.ToPhoneNumber,
                    ToPhoneNumber = messageDetail.FromPhoneNumber,
                    LastMessage = messageDetail.Body,
                    LastMessageTime = messageDetail.Time
                };
                _conversationContext.ConversationDetails.Add(convo);
            }
            await _conversationContext.SaveChangesAsync();

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


        [HttpPost]
        [Route("DeleteMessage")]
        public async Task<ActionResult<MessageDetail>> DeleteMessage(MessageDetail message)
        {
            var messageDetail = await _context.MessageDetails.FindAsync(message.MessageSid);

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
