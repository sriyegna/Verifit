using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VerifitServer.Models;

namespace VerifitServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private UserManager<ApplicationUser> _userManager;

        public UserProfileController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("GetUserProfile")]
        [Authorize]
        [EnableCors("MyPolicy")]
        //GET : /api/UserProfile
        public async Task<Object> GetUserProfile()
        {
            string userId = User.Claims.First(c => c.Type == "UserID").Value;
            var user = await _userManager.FindByIdAsync(userId);
            return new
            {
                FullName = user.FullName,
                Email = user.Email,
                UserName = user.UserName
            };
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [Route("ForAdmin")]
        public string GetForAdmin()
        {
            return "Web method for Admin";
        }

        [HttpGet]
        [Authorize(Roles = "Bronze")]
        [Route("ForBronze")]
        public string GetForBronze()
        {
            return "Web method for Bronze";
        }

        [HttpGet]
        [Authorize(Roles = "Silver")]
        [Route("ForSilver")]
        public string GetForSilver()
        {
            return "Web method for Silver";
        }

        [HttpGet]
        [Authorize(Roles = "Gold")]
        [Route("ForGold")]
        public string GetForGold()
        {
            return "Web method for Gold";
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Bronze,Silver,Gold")]
        [Route("ForAll")]
        public string GetForAll()
        {
            return "Web method for All";
        }

    }
}