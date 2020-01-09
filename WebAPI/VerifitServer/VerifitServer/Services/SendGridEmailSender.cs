using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VerifitServer.Email;

namespace VerifitServer.Services
{
    public class SendGridEmailSender
    {
        public IConfiguration Configuration { get; }

        public SendGridEmailSender(IConfiguration configuration)
        {
            Configuration = configuration;

            var result = Configuration["ApplicationSettings:SendGridKey"].ToString();
        }

        public async Task<SendEmailResponse> SendEmailAsync(string userEmail, string emailSubject, string message)
        {
            var apiKey = Environment.GetEnvironmentVariable(Configuration["ApplicationSettings:SendGridKey"].ToString());
            var client = new SendGridClient(apiKey);
            var from = new EmailAddress("outgoing@Veri.fit", "Veri.Fit");
            var subject = emailSubject;
            var to = new EmailAddress(userEmail, "Verifit");
            var plainTextContent = message;
            var htmlContent = message;
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);

            return new SendEmailResponse();
        }

    }
}

