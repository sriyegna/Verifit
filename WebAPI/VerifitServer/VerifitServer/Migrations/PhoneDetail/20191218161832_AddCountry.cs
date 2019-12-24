using Microsoft.EntityFrameworkCore.Migrations;

namespace VerifitServer.Migrations.PhoneDetail
{
    public partial class AddCountry : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "PhoneDetails",
                type: "nvarchar(3)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Country",
                table: "PhoneDetails");
        }
    }
}
