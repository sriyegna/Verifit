using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.ConversationDetail
{
    public partial class addedConvoName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConversationName",
                table: "ConversationDetails",
                type: "nvarchar(256)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConversationName",
                table: "ConversationDetails");
        }
    }
}
