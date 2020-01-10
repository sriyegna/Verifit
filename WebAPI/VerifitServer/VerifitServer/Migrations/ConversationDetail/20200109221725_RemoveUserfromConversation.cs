using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.ConversationDetail
{
    public partial class RemoveUserfromConversation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserName",
                table: "ConversationDetails");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "ConversationDetails",
                type: "nvarchar(256)",
                nullable: false,
                defaultValue: "");
        }
    }
}
