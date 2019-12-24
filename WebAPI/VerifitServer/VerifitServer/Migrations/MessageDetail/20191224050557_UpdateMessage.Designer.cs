﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using VerifitServer.Models;

namespace VerifitServer.Migrations.MessageDetail
{
    [DbContext(typeof(MessageDetailContext))]
    [Migration("20191224050557_UpdateMessage")]
    partial class UpdateMessage
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.6-servicing-10079")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("VerifitServer.Models.MessageDetail", b =>
                {
                    b.Property<string>("MessageSid")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("Body")
                        .IsRequired()
                        .HasColumnType("nvarchar(MAX)");

                    b.Property<string>("Direction")
                        .IsRequired()
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("FromPhoneNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("TimeCreated")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("TimeSent")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("ToPhoneNumber")
                        .IsRequired()
                        .HasColumnType("nvarchar(20)");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("MessageSid");

                    b.ToTable("MessageDetails");
                });
#pragma warning restore 612, 618
        }
    }
}
