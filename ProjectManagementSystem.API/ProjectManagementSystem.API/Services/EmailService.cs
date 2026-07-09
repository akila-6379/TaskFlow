using System.Net;
using System.Net.Mail;

namespace ProjectManagementSystem.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var section = _config.GetSection("EmailSettings");
            var host = section["Host"]!;
            var port = int.Parse(section["Port"]!);
            var user = section["Username"]!;
            var pass = section["Password"]!;
            var from = section["From"]!;

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true,
            };

            var mail = new MailMessage(from, toEmail, subject, htmlBody)
            {
                IsBodyHtml = true,
            };

            await client.SendMailAsync(mail);
        }
    }
}
