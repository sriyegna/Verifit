using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.ConversationDetail
{
    public partial class UpdateConversation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConversationDetails",
                columns: table => new
                {
                    ConversationId = table.Column<string>(type: "nvarchar(512)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", nullable: false),
                    FromPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    ToPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    LastMessage = table.Column<string>(type: "nvarchar(MAX)", nullable: false),
                    LastMessageTime = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationDetails", x => x.ConversationId);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConversationDetails");
        }
    }
}
