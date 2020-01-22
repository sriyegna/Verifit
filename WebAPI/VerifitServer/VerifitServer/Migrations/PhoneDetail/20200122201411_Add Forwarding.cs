using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.PhoneDetail
{
    public partial class AddForwarding : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeCreated",
                table: "MessageDetail");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "MessageDetail");

            migrationBuilder.RenameColumn(
                name: "TimeSent",
                table: "MessageDetail",
                newName: "Time");

            migrationBuilder.AddColumn<string>(
                name: "ForwardingNumber",
                table: "PhoneDetails",
                type: "nvarchar(20)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ForwardingNumber",
                table: "PhoneDetails");

            migrationBuilder.RenameColumn(
                name: "Time",
                table: "MessageDetail",
                newName: "TimeSent");

            migrationBuilder.AddColumn<string>(
                name: "TimeCreated",
                table: "MessageDetail",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "MessageDetail",
                type: "nvarchar(256)",
                nullable: false,
                defaultValue: "");
        }
    }
}
