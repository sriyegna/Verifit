using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Serialization;
using PhoneAPI.Models;
using VerifitServer.Models;
using static VerifitServer.Services.OnIncomingMessage;

namespace VerifitServer
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;

            
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            //Inject AppSettings Configuration
            services.Configure<ApplicationSettings>(Configuration.GetSection("ApplicationSettings"));
            
            //PhoneDb

            services.AddDbContext<PhoneDetailContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DevConnection")));

            services.AddDbContext<ConversationDetailContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DevConnection")));

            services.AddDbContext<MessageDetailContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DevConnection")));


            //Identity
            services.AddDbContext<AuthenticationContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("IdentityConnection"))
                );

            services.AddDefaultIdentity<ApplicationUser>()
                .AddRoles<IdentityRole>()
                .AddEntityFrameworkStores<AuthenticationContext>();

            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;
            }
            );

            services.AddHttpsRedirection(options => options.HttpsPort = 4440);

            services.AddCors(o => o.AddPolicy("MyPolicy", builder =>
            {
                builder.AllowAnyMethod()
                       .AllowAnyHeader();
            }));


            //JWT Auth
            var key = Encoding.UTF8.GetBytes(Configuration["ApplicationSettings:JWT_Secret"].ToString());
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = false;
            x.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            });

            services.AddMvc()
                .AddControllersAsServices();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }


            app.UseCors("MyPolicy");

            /*app.UseCors(builder =>
            builder
            .AllowAnyOrigin()
            .AllowAnyHeader().AllowAnyMethod());
            */

            /*
            app.UseCors(builder =>
            builder
            .WithOrigins(Configuration["ApplicationSettings:Client_URL"].ToString())
            .WithOrigins(Configuration["ApplicationSettings:Client_URL2"].ToString())
            .AllowAnyHeader().AllowAnyMethod());
            */

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseMvc();
        }
    }
}
