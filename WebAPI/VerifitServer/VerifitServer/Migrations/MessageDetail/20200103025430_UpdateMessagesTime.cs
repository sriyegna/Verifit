using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.MessageDetail
{
    public partial class UpdateMessagesTime : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeCreated",
                table: "MessageDetails");

            migrationBuilder.RenameColumn(
                name: "TimeSent",
                table: "MessageDetails",
                newName: "Time");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Time",
                table: "MessageDetails",
                newName: "TimeSent");

            migrationBuilder.AddColumn<string>(
                name: "TimeCreated",
                table: "MessageDetails",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "");
        }
    }
}
