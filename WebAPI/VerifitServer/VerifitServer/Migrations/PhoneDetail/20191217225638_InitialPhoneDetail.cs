using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.PhoneDetail
{
    public partial class InitialPhoneDetail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PhoneDetails",
                columns: table => new
                {
                    PhoneSid = table.Column<string>(type: "nvarchar(60)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    TimeCreated = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    TimeExpired = table.Column<string>(type: "nvarchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhoneDetails", x => x.PhoneSid);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhoneDetails");
        }
    }
}
