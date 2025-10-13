from django.core.management.base import BaseCommand
from django.conf import settings
from datetime import datetime, timedelta
import os


class Command(BaseCommand):
    help = 'Clean up generated PDF documents older than 3 days'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=3,
            help='Number of days to keep files (default: 3)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']

        media_root = settings.MEDIA_ROOT
        generated_docs_dir = os.path.join(media_root, 'generated_docs')

        if not os.path.exists(generated_docs_dir):
            self.stdout.write(
                self.style.WARNING(f'Generated docs directory does not exist: {generated_docs_dir}')
            )
            return

        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        deleted_dirs = 0

        self.stdout.write(f'Cleaning up files older than {days} days...')
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No files will be deleted'))

        # Clean up old files
        for root, dirs, files in os.walk(generated_docs_dir):
            for file in files:
                if file.endswith('.pdf'):
                    file_path = os.path.join(root, file)
                    file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))

                    if file_mtime < cutoff_date:
                        if dry_run:
                            self.stdout.write(f'Would delete: {file_path}')
                        else:
                            try:
                                os.remove(file_path)
                                self.stdout.write(f'Deleted: {file_path}')
                                deleted_count += 1
                            except OSError as e:
                                self.stdout.write(
                                    self.style.ERROR(f'Error deleting {file_path}: {e}')
                                )

        # Remove empty directories
        for root, dirs, files in os.walk(generated_docs_dir, topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                try:
                    if not os.listdir(dir_path):
                        if dry_run:
                            self.stdout.write(f'Would remove empty directory: {dir_path}')
                        else:
                            os.rmdir(dir_path)
                            self.stdout.write(f'Removed empty directory: {dir_path}')
                            deleted_dirs += 1
                except OSError:
                    pass

        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(f'Dry run complete. Would delete {deleted_count} files and {deleted_dirs} directories.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Cleanup complete. Deleted {deleted_count} files and {deleted_dirs} directories.')
            )