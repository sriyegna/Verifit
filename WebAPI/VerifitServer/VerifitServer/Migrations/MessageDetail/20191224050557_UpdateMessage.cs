using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.MessageDetail
{
    public partial class UpdateMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "MessageDetails",
                type: "nvarchar(256)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserName",
                table: "MessageDetails");
        }
    }
}
