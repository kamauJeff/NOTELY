BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Users] (
    [UserID] NVARCHAR(1000) NOT NULL,
    [FirstName] NVARCHAR(1000) NOT NULL,
    [LastName] NVARCHAR(1000) NOT NULL,
    [Username] NVARCHAR(1000) NOT NULL,
    [EmailAddress] NVARCHAR(1000) NOT NULL,
    [Password] NVARCHAR(1000) NOT NULL,
    [Avatar] NVARCHAR(1000),
    [IsDeleted] BIT NOT NULL CONSTRAINT [Users_IsDeleted_df] DEFAULT 0,
    [DateJoined] DATETIME2 NOT NULL CONSTRAINT [Users_DateJoined_df] DEFAULT CURRENT_TIMESTAMP,
    [LastUpdate] DATETIME2 NOT NULL,
    CONSTRAINT [Users_pkey] PRIMARY KEY CLUSTERED ([UserID]),
    CONSTRAINT [Users_Username_key] UNIQUE NONCLUSTERED ([Username]),
    CONSTRAINT [Users_EmailAddress_key] UNIQUE NONCLUSTERED ([EmailAddress])
);

-- CreateTable
CREATE TABLE [dbo].[Entries] (
    [EntryID] NVARCHAR(1000) NOT NULL,
    [EntryTitle] NVARCHAR(1000) NOT NULL,
    [Synopsis] NVARCHAR(1000) NOT NULL,
    [Content] NVARCHAR(1000) NOT NULL,
    [IsDeleted] BIT NOT NULL CONSTRAINT [Entries_IsDeleted_df] DEFAULT 0,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Entries_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [LastUpdated] DATETIME2 NOT NULL,
    [IsPublic] BIT NOT NULL CONSTRAINT [Entries_IsPublic_df] DEFAULT 0,
    [UserID] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Entries_pkey] PRIMARY KEY CLUSTERED ([EntryID])
);

-- CreateTable
CREATE TABLE [dbo].[Bookmarks] (
    [BookmarkID] NVARCHAR(1000) NOT NULL,
    [UserID] NVARCHAR(1000) NOT NULL,
    [EntryID] NVARCHAR(1000) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Bookmarks_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Bookmarks_pkey] PRIMARY KEY CLUSTERED ([BookmarkID]),
    CONSTRAINT [Bookmarks_UserID_EntryID_key] UNIQUE NONCLUSTERED ([UserID],[EntryID])
);

-- CreateTable
CREATE TABLE [dbo].[PinnedEntries] (
    [PinnedID] NVARCHAR(1000) NOT NULL,
    [UserID] NVARCHAR(1000) NOT NULL,
    [EntryID] NVARCHAR(1000) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [PinnedEntries_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PinnedEntries_pkey] PRIMARY KEY CLUSTERED ([PinnedID]),
    CONSTRAINT [PinnedEntries_UserID_EntryID_key] UNIQUE NONCLUSTERED ([UserID],[EntryID])
);

-- AddForeignKey
ALTER TABLE [dbo].[Entries] ADD CONSTRAINT [Entries_UserID_fkey] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Bookmarks] ADD CONSTRAINT [Bookmarks_UserID_fkey] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Bookmarks] ADD CONSTRAINT [Bookmarks_EntryID_fkey] FOREIGN KEY ([EntryID]) REFERENCES [dbo].[Entries]([EntryID]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PinnedEntries] ADD CONSTRAINT [PinnedEntries_UserID_fkey] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PinnedEntries] ADD CONSTRAINT [PinnedEntries_EntryID_fkey] FOREIGN KEY ([EntryID]) REFERENCES [dbo].[Entries]([EntryID]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
