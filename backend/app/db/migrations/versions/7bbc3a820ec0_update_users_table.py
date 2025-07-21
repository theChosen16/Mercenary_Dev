"""update_users_table

Revision ID: 7bbc3a820ec0
Revises: 
Create Date: 2025-07-20 19:48:33.097722

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7bbc3a820ec0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('username', sa.String(50), unique=True, nullable=True))
    op.add_column('users', sa.Column('full_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('profile_picture', sa.String(255), nullable=True))
    
    # Add role enum type
    user_role = postgresql.ENUM('admin', 'mercenary', 'offerer', name='userrole')
    user_role.create(op.get_bind())
    
    # Add role column with the new enum type (initially nullable)
    op.add_column('users', sa.Column('role', user_role, nullable=True))
    
    # Set default value using raw SQL to avoid encoding issues
    op.execute("UPDATE users SET role = 'mercenary'")
    
    # Now make the column non-nullable
    op.alter_column('users', 'role', nullable=False, server_default=sa.text("'mercenary'::userrole"))
    
    # Rename is_offerer to is_active (since we now have a role column)
    op.alter_column('users', 'is_offerer', new_column_name='is_active', server_default=sa.text('true'))
    
    # Make email and hashed_password non-nullable if they aren't already
    op.alter_column('users', 'email', existing_type=sa.VARCHAR(255), nullable=False)
    op.alter_column('users', 'hashed_password', existing_type=sa.VARCHAR(255), nullable=False)
    
    # Add indexes for better query performance
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    # Remove indexes
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    
    # Revert column changes
    op.alter_column('users', 'is_active', new_column_name='is_offerer')
    op.alter_column('users', 'email', existing_type=sa.VARCHAR(255), nullable=True)
    op.alter_column('users', 'hashed_password', existing_type=sa.VARCHAR(255), nullable=True)
    
    # Drop added columns
    op.drop_column('users', 'role')
    op.drop_column('users', 'profile_picture')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'full_name')
    op.drop_column('users', 'username')
    
    # Drop the enum type
    user_role = postgresql.ENUM('admin', 'mercenary', 'offerer', name='userrole')
    user_role.drop(op.get_bind())
