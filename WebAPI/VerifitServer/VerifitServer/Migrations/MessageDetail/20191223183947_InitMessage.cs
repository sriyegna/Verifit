using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.MessageDetail
{
    public partial class InitMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MessageDetails",
                columns: table => new
                {
                    MessageSid = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(MAX)", nullable: false),
                    TimeCreated = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    TimeSent = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Direction = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    FromPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    ToPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageDetails", x => x.MessageSid);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageDetails");
        }
    }
}
