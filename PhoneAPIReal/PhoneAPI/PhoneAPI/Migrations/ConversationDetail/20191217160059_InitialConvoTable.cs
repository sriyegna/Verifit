using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace PhoneAPI.Migrations.ConversationDetail
{
    public partial class InitialConvoTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConversationDetails",
                columns: table => new
                {
                    ConversationId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    FromPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    ToPhoneNumber = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    LastMessage = table.Column<string>(type: "nvarchar(MAX)", nullable: false),
                    LastMessageTime = table.Column<string>(type: "nvarchar(20)", nullable: false)
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
