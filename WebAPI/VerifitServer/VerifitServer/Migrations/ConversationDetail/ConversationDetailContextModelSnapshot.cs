﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using PhoneAPI.Models;

namespace VerifitServer.Migrations.ConversationDetail
{
    [DbContext(typeof(ConversationDetailContext))]
    partial class ConversationDetailContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("PhoneAPI.Models.ConversationDetail", b =>
                {
                    b.Property<string>("ConversationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("nvarchar(512)");

                    b.Property<string>("ConversationName")
                        .IsRequired()
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("FromPhoneNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("LastMessage")
                        .IsRequired()
                        .HasColumnType("nvarchar(MAX)");

                    b.Property<string>("LastMessageTime")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("ToPhoneNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(20)");

                    b.HasKey("ConversationId");

                    b.ToTable("ConversationDetails");
                });
#pragma warning restore 612, 618
        }
    }
}
