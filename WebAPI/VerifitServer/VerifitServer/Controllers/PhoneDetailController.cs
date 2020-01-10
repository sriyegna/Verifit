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
using VerifitServer.Models;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using RestSharp;
using Newtonsoft.Json.Linq;

namespace VerifitServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhoneDetailController : ControllerBase
    {
        private readonly PhoneDetailContext _context;
        private readonly MessageDetailContext _messageContext;
        private readonly ConversationDetailContext _conversationContext;

        public PhoneDetailController(PhoneDetailContext context, MessageDetailContext messageContext, ConversationDetailContext conversationContext)
        {
            _context = context;
            _messageContext = messageContext;
            _conversationContext = conversationContext;
        }
        

        // Get Phone numbers for User
        // GET: api/PhoneDetails
        [HttpGet("GetUserPhoneNumbers/{username}")]
        public async Task<ActionResult<IEnumerable<PhoneDetail>>> GetUserPhoneNumbers(string username)
        {
            Console.WriteLine(username);
            var newResult = await _context.PhoneDetails.Where(a => (a.UserName == username)).ToListAsync();

            return newResult;
        } 


        // Update for Phone Number
        // GET: api/PhoneDetails
        [HttpGet("GetPhoneConversations/{username}&{phone}")]
        public async Task<ActionResult<PhoneDetail>> GetPhoneConversations(string username, string phone)
        {            //Update messages for all user phone numbers

            phone = "+" + phone;
            PhoneDetail newResult = _context.PhoneDetails.Where(a => (a.PhoneNumber == phone)).FirstOrDefault();

            return newResult;
        }

        [HttpGet("UpdatePhoneConversations/{phone}")]
        public async Task<ActionResult<IEnumerable<ConversationDetail>>> UpdatePhoneConversations(string phone)
        {
            phone = "+" + phone;
            
            var newResult = await _conversationContext.ConversationDetails.Where(a => (a.FromPhoneNumber == phone)).OrderByDescending(a => DateTime.Parse(a.LastMessageTime)).ToListAsync();
            return newResult;
        }

        // Update for Phone Number
        // GET: api/PhoneDetails
        [HttpGet("GetConversationMessages/{fromPhoneNumber}&{toPhoneNumber}")]
        public async Task<ActionResult<ConversationDetail>> GetConversationMessages(string fromPhoneNumber, string toPhoneNumber)
        {            //Update messages for all user phone numbers

            fromPhoneNumber = "+" + fromPhoneNumber;
            toPhoneNumber = "+" + toPhoneNumber;

            ConversationDetail newResult = _conversationContext.ConversationDetails.Where(a => ((a.ToPhoneNumber == toPhoneNumber) && (a.FromPhoneNumber == fromPhoneNumber))).FirstOrDefault();

            return newResult;
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
        [Route("RequestCanNumber")]
        public async Task<ActionResult<PhoneDetail>> PostPhoneDetailCan(PhoneDetail phoneDetail)
        {

            var client = new RestClient("https://manish.signalwire.com/api/relay/rest/phone_numbers/search?areacode=289");
            var request = new RestRequest(Method.GET);
            var cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            var response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);
            var jsonObj = JObject.Parse(response.Content.ToString());
            var numList = jsonObj["data"].Last();
            Debug.WriteLine(numList);
            var numberToPurchase = jsonObj["data"].Last()["e164"];
            Debug.WriteLine(numberToPurchase);


            //Purchase #
            client = new RestClient("https://manish.signalwire.com/api/relay/rest/phone_numbers/");
            request = new RestRequest(Method.POST);
            cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
            request.AddParameter("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW", "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"number\"\r\n\r\n" + numberToPurchase + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--", ParameterType.RequestBody);
            response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);
            var purchasedNumberId = (JObject.Parse(response.Content.ToString()))["id"];
            Debug.Write("ID of Phone no");
            Debug.Write(purchasedNumberId);

            //Add to Group Membership
            client = new RestClient("https://manish.signalwire.com/api/relay/rest/number_groups/4ccced3c-c49b-4cfe-a70b-b647c2e4b549/number_group_memberships");
            request = new RestRequest(Method.POST);
            cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
            request.AddParameter("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW", "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"phone_number_id\"\r\n\r\n" + purchasedNumberId + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--", ParameterType.RequestBody);
            response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);

            //Add context to group
            client = new RestClient("https://manish.signalwire.com/api/relay/rest/phone_numbers/" + purchasedNumberId);
            request = new RestRequest(Method.PUT);
            cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
            request.AddParameter("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW", "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nVerifitGroup\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"message_handler\"\r\n\r\nrelay_context\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"message_relay_context\"\r\n\r\nVerifit\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--", ParameterType.RequestBody);
            response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);

            //Save it to model
            phoneDetail.UserName = (phoneDetail.UserName).ToLower();
            Console.WriteLine(phoneDetail.UserName);
            phoneDetail.PhoneNumber = numberToPurchase.ToString();
            phoneDetail.PhoneSid = purchasedNumberId.ToString();
            DateTime createDate = DateTime.Now;
            DateTime expireDate = createDate.AddDays(30);
            phoneDetail.TimeCreated = (createDate.ToString("s"));
            phoneDetail.TimeExpired = (expireDate.ToString("s"));


            _context.PhoneDetails.Add(phoneDetail);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPhoneDetail", new { id = phoneDetail.PhoneSid }, phoneDetail);
        }

        // POST: api/PhoneDetails
        [HttpPost]
        [Route("RequestUsNumber")]
        public async Task<ActionResult<PhoneDetail>> PostPhoneDetailUs(PhoneDetail phoneDetail)
        {

            var client = new RestClient("https://manish.signalwire.com/api/relay/rest/phone_numbers/search?region=TX");
            var request = new RestRequest(Method.GET);
            var cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            var response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);
            var jsonObj = JObject.Parse(response.Content.ToString());
            var numList = jsonObj["data"].Last();
            Debug.WriteLine(numList);
            var numberToPurchase = jsonObj["data"].Last()["e164"];
            Debug.WriteLine(numberToPurchase);


            //Purchase #
            client = new RestClient("https://manish.signalwire.com/api/relay/rest/phone_numbers/");
            request = new RestRequest(Method.POST);
            cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
            request.AddParameter("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW", "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"number\"\r\n\r\n" + numberToPurchase + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--", ParameterType.RequestBody);
            response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);
            var purchasedNumberId = (JObject.Parse(response.Content.ToString()))["id"];
            Debug.Write("ID of Phone no");
            Debug.Write(purchasedNumberId);

            //Add to Group Membership
            client = new RestClient("https://manish.signalwire.com/api/relay/rest/number_groups/4ccced3c-c49b-4cfe-a70b-b647c2e4b549/number_group_memberships");
            request = new RestRequest(Method.POST);
            cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
            request.AddParameter("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW", "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"phone_number_id\"\r\n\r\n" + purchasedNumberId + "\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--", ParameterType.RequestBody);
            response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);

            //Add context to group
            client = new RestClient("https://manish.signalwire.com/api/relay/rest/phone_numbers/" + purchasedNumberId);
            request = new RestRequest(Method.PUT);
            cancellationTokenSource = new System.Threading.CancellationTokenSource();
            request.AddHeader("Authorization", "Basic MjgzNjFlNmMtODViOC00MGY1LWJkZTEtYmZjOGNmNjhhOTZjOlBUNjViZmE3NDc5ZWZkOThjMzhmNTI1ZTdjMzUyMjc3ZTcwYWZmNjNlZjIyZjRlOGJl");
            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("content-type", "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW");
            request.AddParameter("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW", "------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nVerifitGroup\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"message_handler\"\r\n\r\nrelay_context\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"message_relay_context\"\r\n\r\nVerifit\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--", ParameterType.RequestBody);
            response = await client.ExecuteTaskAsync(request, cancellationTokenSource.Token);

            //Save it to model
            Console.WriteLine(phoneDetail.UserName);
            phoneDetail.UserName = (phoneDetail.UserName).ToLower();
            phoneDetail.PhoneNumber = numberToPurchase.ToString();
            phoneDetail.PhoneSid = purchasedNumberId.ToString();
            DateTime createDate = DateTime.Now;
            DateTime expireDate = createDate.AddDays(30);
            phoneDetail.TimeCreated = (createDate.ToString("s"));
            phoneDetail.TimeExpired = (expireDate.ToString("s"));


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
