using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.PhoneDetail
{
    public partial class UpdatePhone : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TimeExpired",
                table: "PhoneDetails",
                type: "nvarchar(50)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)");

            migrationBuilder.AlterColumn<string>(
                name: "TimeCreated",
                table: "PhoneDetails",
                type: "nvarchar(50)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)");

            migrationBuilder.CreateTable(
                name: "MessageDetail",
                columns: table => new
                {
                    MessageSid = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(MAX)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    TimeCreated = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    TimeSent = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    Direction = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    FromPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    ToPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageDetail", x => x.MessageSid);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageDetail");

            migrationBuilder.AlterColumn<string>(
                name: "TimeExpired",
                table: "PhoneDetails",
                type: "nvarchar(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)");

            migrationBuilder.AlterColumn<string>(
                name: "TimeCreated",
                table: "PhoneDetails",
                type: "nvarchar(20)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)");
        }
    }
}
