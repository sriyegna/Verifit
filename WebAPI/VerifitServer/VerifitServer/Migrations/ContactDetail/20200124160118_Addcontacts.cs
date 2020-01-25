using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.ContactDetail
{
    public partial class Addcontacts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactDetails",
                columns: table => new
                {
                    ContactId = table.Column<string>(type: "nvarchar(512)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactDetails", x => x.ContactId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactDetails");
        }
    }
}
