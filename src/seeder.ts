// src/seeder.ts
import { NestFactory } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { RolesService } from './admin/roles/roles.service';
import { PermissionsService } from './admin/permissions/permissions.service';
import { UsersService } from './admin/users/users.service';
import * as bcrypt from 'bcryptjs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EntityStatus } from 'src/common/enums/status.enum';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AdminModule);

    const rolesService = app.get(RolesService);
    const permissionsService = app.get(PermissionsService);
    const usersService = app.get(UsersService);

    console.log('🌱 Starting unified database seeding...');

    try {
        // 1. Create super admin user
        // we should not create super admin user if it already exists
        const superAdminUser = await usersService.findByEmail('info@geeken.com');
        if (!superAdminUser) {
            throw new NotFoundException('User not found');
        }

        // 1. Seed permissions
        console.log('📝 Creating/updating permissions...');
        const permissions = [
            // User permissions
            { name: 'create_super_admin', description: 'Create new super admins', group: 'Super Admin' },
            { name: 'read_super_admin', description: 'Read super admin information', group: 'Super Admin' },
            { name: 'update_super_admin', description: 'Update super admin information', group: 'Super Admin' },
            { name: 'delete_super_admin', description: 'Delete super admins', group: 'Super Admin' },
            { name: 'assign_role', description: 'Assign roles to super admins', group: 'Super Admin' },
            { name: 'assign_permission', description: 'Assign permissions to super admins', group: 'Super Admin' },
            { name: 'remove_role', description: 'Remove roles from super admins', group: 'Super Admin' },
            { name: 'remove_permission', description: 'Remove permissions from super admins', group: 'Super Admin' },

            { name: 'create_admin', description: 'Create new admins', group: 'Admin' },
            { name: 'read_admin', description: 'Read admin information', group: 'Admin' },
            { name: 'update_admin', description: 'Update admin information', group: 'Admin' },
            { name: 'delete_admin', description: 'Delete admins', group: 'Admin' },
            { name: 'assign_role', description: 'Assign roles to admins', group: 'Admin' },
            { name: 'assign_permission', description: 'Assign permissions to admins', group: 'Admin' },
            { name: 'remove_role', description: 'Remove roles from admins', group: 'Admin' },
            { name: 'remove_permission', description: 'Remove permissions from admins', group: 'Admin' },

            { name: 'create_partner', description: 'Create new partners', group: 'Partner' },
            { name: 'read_partner', description: 'Read partner information', group: 'Partner' },
            { name: 'update_partner', description: 'Update partner information', group: 'Partner' },
            { name: 'delete_partner', description: 'Delete partners', group: 'Partner' },

            { name: 'create_employee', description: 'Create new employees', group: 'Employee' },
            { name: 'read_employee', description: 'Read employee information', group: 'Employee' },
            { name: 'update_employee', description: 'Update employee information', group: 'Employee' },
            { name: 'delete_employee', description: 'Delete employees', group: 'Employee' },

            { name: 'create_user', description: 'Create new users', group: 'User' },
            { name: 'read_user', description: 'Read user information', group: 'User' },
            { name: 'update_user', description: 'Update user information', group: 'User' },
            { name: 'delete_user', description: 'Delete users', group: 'User' },
            // { name: 'assign_role', description: 'Assign roles to users', group: 'User' },
            // { name: 'assign_permission', description: 'Assign permissions to users', group: 'User' },
            // { name: 'remove_role', description: 'Remove roles from users', group: 'User' },
            // { name: 'remove_permission', description: 'Remove permissions from users', group: 'User' },
            // Role permissions
            { name: 'create_role', description: 'Create new roles', group: 'Role' },
            { name: 'read_role', description: 'Read role information', group: 'Role' },
            { name: 'update_role', description: 'Update role information', group: 'Role' },
            { name: 'delete_role', description: 'Delete roles', group: 'Role' },
            { name: 'assign_permission', description: 'Assign permissions to roles', group: 'Role' },
            { name: 'remove_permission', description: 'Remove permissions from roles', group: 'Role' },
            // Permission permissions
            { name: 'create_permission', description: 'Create new permissions', group: 'Permission' },
            { name: 'read_permission', description: 'Read permission information', group: 'Permission' },
            { name: 'update_permission', description: 'Update permission information', group: 'Permission' },
            { name: 'delete_permission', description: 'Delete permissions', group: 'Permission' },
            // Product permissions
            { name: 'create_product', description: 'Create new products', group: 'Product' },
            { name: 'read_product', description: 'Read product information', group: 'Product' },
            { name: 'update_product', description: 'Update product information', group: 'Product' },
            { name: 'delete_product', description: 'Delete products', group: 'Product' },
            // Product variant permissions
            { name: 'create_product_variant', description: 'Create new product variants', group: 'Product Variant' },
            { name: 'read_product_variant', description: 'Read product variant information', group: 'Product Variant' },
            { name: 'update_product_variant', description: 'Update product variant information', group: 'Product Variant' },
            { name: 'delete_product_variant', description: 'Delete product variants', group: 'Product Variant' },
            // Collection permissions
            { name: 'create_collection', description: 'Create new collections', group: 'Collection' },
            { name: 'read_collection', description: 'Read collection information', group: 'Collection' },
            { name: 'update_collection', description: 'Update collection information', group: 'Collection' },
            { name: 'delete_collection', description: 'Delete collections', group: 'Collection' },
            // Blog permissions
            { name: 'create_blog', description: 'Create new blogs', group: 'Blog' },
            { name: 'read_blog', description: 'Read blog information', group: 'Blog' },
            { name: 'update_blog', description: 'Update blog information', group: 'Blog' },
            { name: 'delete_blog', description: 'Delete blogs', group: 'Blog' },
            // Blog category permissions
            { name: 'create_blog_category', description: 'Create new blog categories', group: 'Blog Category' },
            { name: 'read_blog_category', description: 'Read blog category information', group: 'Blog Category' },
            { name: 'update_blog_category', description: 'Update blog category information', group: 'Blog Category' },
            { name: 'delete_blog_category', description: 'Delete blog categories', group: 'Blog Category' },

            // File permissions
            { name: 'create_file', description: 'Create new files', group: 'File' },
            { name: 'read_file', description: 'Read file information', group: 'File' },
            { name: 'update_file', description: 'Update file information', group: 'File' },
            { name: 'delete_file', description: 'Delete files', group: 'File' },
            // Page permissions
            { name: 'create_page', description: 'Create new pages', group: 'Page' },
            { name: 'read_page', description: 'Read page information', group: 'Page' },
            { name: 'update_page', description: 'Update page information', group: 'Page' },
            { name: 'delete_page', description: 'Delete pages', group: 'Page' },
            // Banner permissions
            { name: 'create_banner', description: 'Create new banners', group: 'Banner' },
            { name: 'read_banner', description: 'Read banner information', group: 'Banner' },
            { name: 'update_banner', description: 'Update banner information', group: 'Banner' },
            { name: 'delete_banner', description: 'Delete banners', group: 'Banner' },
            // Enquiry permissions
            { name: 'create_enquiry', description: 'Create new enquiries', group: 'Enquiry' },
            { name: 'read_enquiry', description: 'Read enquiry information', group: 'Enquiry' },
            { name: 'update_enquiry', description: 'Update enquiry information', group: 'Enquiry' },
            { name: 'delete_enquiry', description: 'Delete enquiries', group: 'Enquiry' },
            // Ticket permissions
            { name: 'create_ticket', description: 'Create new tickets', group: 'Ticket' },
            { name: 'read_ticket', description: 'Read ticket information', group: 'Ticket' },
            { name: 'update_ticket', description: 'Update ticket information', group: 'Ticket' },
            { name: 'delete_ticket', description: 'Delete tickets', group: 'Ticket' },

            // Type permissions
            { name: 'create_type', description: 'Create new types', group: 'Type' },
            { name: 'read_type', description: 'Read type information', group: 'Type' },
            { name: 'update_type', description: 'Update type information', group: 'Type' },
            { name: 'delete_type', description: 'Delete types', group: 'Type' },
            // Testimonial permissions
            { name: 'create_testimonial', description: 'Create new testimonials', group: 'Testimonial' },
            { name: 'read_testimonial', description: 'Read testimonial information', group: 'Testimonial' },
            { name: 'update_testimonial', description: 'Update testimonial information', group: 'Testimonial' },
            { name: 'delete_testimonial', description: 'Delete testimonials', group: 'Testimonial' },
            // Discount permissions
            { name: 'create_discount', description: 'Create new discounts', group: 'Discount' },
            { name: 'read_discount', description: 'Read discount information', group: 'Discount' },
            { name: 'update_discount', description: 'Update discount information', group: 'Discount' },
            { name: 'delete_discount', description: 'Delete discounts', group: 'Discount' },
            // Amenity permissions
            { name: 'create_amenity', description: 'Create new amenities', group: 'Amenity' },
            { name: 'read_amenity', description: 'Read amenity information', group: 'Amenity' },
            { name: 'update_amenity', description: 'Update amenity information', group: 'Amenity' },
            { name: 'delete_amenity', description: 'Delete amenities', group: 'Amenity' },
            // Amenity category permissions
            { name: 'create_amenity_category', description: 'Create new amenity categories', group: 'Amenity Category' },
            { name: 'read_amenity_category', description: 'Read amenity_category information', group: 'Amenity Category' },
            { name: 'update_amenity_category', description: 'Update amenity category information', group: 'Amenity Category' },
            { name: 'delete_amenity_category', description: 'Delete amenity categories', group: 'Amenity Category' },
            // Order permissions
            { name: 'create_order', description: 'Create new orders', group: 'Order' },
            { name: 'read_order', description: 'Read order information', group: 'Order' },
            { name: 'update_order', description: 'Update order information', group: 'Order' },
            { name: 'delete_order', description: 'Delete orders', group: 'Order' },
        ];
        let createdOrUpdatedPermissions = 0;
        for (const permission of permissions) {
            try {
                await permissionsService.create(permission, superAdminUser.id);
                createdOrUpdatedPermissions++;
                console.log(`✅ Created permission: ${permission.name}`);
            } catch (error) {
                if (error instanceof ConflictException || (error.message && error.message.includes('already exists'))) {
                    // Update if exists
                    const existing = await permissionsService.findAll({ page: 1, limit: 1000 });
                    const found = existing.items.find(p => p.name === permission.name);
                    if (found) {
                        await permissionsService.update(found.id, permission);
                        createdOrUpdatedPermissions++;
                        console.log(`♻️  Updated permission: ${permission.name}`);
                    }
                } else {
                    console.error(`❌ Error creating/updating permission ${permission.name}:`, error.message);
                }
            }
        }

        // 2. Seed roles (with permissions)
        console.log('\n👥 Creating/updating roles...');
        const roles = [
            {
                name: 'super_admin',
                description: 'Super Administrator with full system access',
                permissions: permissions.map(p => p.name),
            },
            {
                name: 'admin',
                description: 'Administrator with management access',
                permissions: [
                    'create_user', 'read_user', 'update_user',
                    'assign_role', 'assign_permission',
                    'read_role', 'read_permission',
                    'create_product', 'read_product', 'update_product', 'delete_product',
                ],
            },
            {
                name: 'partner',
                description: 'Partner with limited administrative access',
                permissions: [
                    'read_user',
                    'read_role', 'read_permission',
                    'create_product', 'read_product', 'update_product',
                ],
            },
            {
                name: 'employee',
                description: 'Employee with limited administrative access',
                permissions: ['read_product'],
            },
            {
                name: 'guest',
                description: 'Guest user for hotel bookings and other services',
                permissions: [],
            },
            {
                name: 'user',
                description: 'Normal user for webiste',
                permissions: [],
            },
        ];
        let createdOrUpdatedRoles = 0;
        for (const roleData of roles) {
            try {
                const { permissions: rolePermissions, ...roleInfo } = roleData;
                let role;
                try {

                    role = await rolesService.create(roleInfo, superAdminUser.id);
                    createdOrUpdatedRoles++;
                    console.log(`✅ Created role: ${roleInfo.name}`);
                } catch (error) {
                    if (error instanceof ConflictException || (error.message && error.message.includes('already exists'))) {
                        // Update if exists
                        const existing = await rolesService.findOneByName(roleInfo.name);
                        role = await rolesService.update(existing.id, roleInfo);
                        createdOrUpdatedRoles++;
                        console.log(`♻️  Updated role: ${roleInfo.name}`);
                    } else {
                        throw error;
                    }
                }
                // Assign permissions to role
                for (const permissionName of rolePermissions) {
                    try {
                        await rolesService.assignPermission(role.id, permissionName);
                        console.log(`  🔗 Assigned permission: ${permissionName}`);
                    } catch (error) {
                        if (error instanceof ConflictException || (error.message && error.message.includes('already has this permission'))) {
                            // Already assigned, skip
                        } else {
                            console.error(`  ❌ Error assigning permission ${permissionName}:`, error.message);
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Error creating/updating role ${roleData.name}:`, error.message);
            }
        }

        // 3. Seed users (with roles and optional permissions)
        console.log('\n👤 Creating/updating users...');
        const users = [
            {
                email: 'info@geeken.com',
                password: 'admin$123',
                firstName: 'Ashutosh',
                lastName: 'Bhardwaj',
                roleName: 'super_admin',
                status: 'active',
            },
            {
                email: 'amits.mmbo@gmail.com',
                password: 'admin$123',
                firstName: 'Amit',
                lastName: 'Shakya',
                roleName: 'super_admin',
                status: 'active',
            },
            {
                email: 'ashutosh.mmbo@gmail.com',
                password: 'admin$123',
                firstName: 'Ashutosh',
                lastName: 'Bhardwaj',
                roleName: 'super_admin',
                status: 'active',
            },
            {
                email: 'admin@geeken.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                roleName: 'admin',
                status: 'active',
            },
            {
                email: 'partner@geeken.com',
                password: 'partner123',
                firstName: 'Partner',
                lastName: 'User',
                roleName: 'partner',
                status: 'active',
            },
            {
                email: 'employee@geeken.com',
                password: 'employee123',
                firstName: 'Employee',
                lastName: 'User',
                roleName: 'employee',
            },
            {
                email: 'guest@geeken.com',
                password: 'guest123',
                firstName: 'Guest',
                lastName: 'User',
                roleName: 'guest',
                status: 'active',
            },
            {
                email: 'user@geeken.com',
                password: 'user123',
                firstName: 'User',
                lastName: 'Website',
                roleName: 'user',
                status: 'active',
            },
        ];
        let createdOrUpdatedUsers = 0;
        for (const userData of users) {
            try {
                const { roleName, ...userInfo } = userData;
                let user;
                let isNew = false;
                // Hash password
                const hashedPassword = await bcrypt.hash(userInfo.password, 10);
                try {
                    user = await usersService.create({ ...userInfo, password: hashedPassword, status: EntityStatus.ACTIVE, });
                    createdOrUpdatedUsers++;
                    isNew = true;
                    console.log(`✅ Created user: ${userInfo.email}`);
                } catch (error) {
                    if (error instanceof ConflictException || (error.message && error.message.includes('already exists'))) {
                        // Update if exists
                        user = await usersService.findByEmail(userInfo.email);
                        await usersService.update(user.id, { ...userInfo, password: hashedPassword, status: EntityStatus.ACTIVE, });
                        createdOrUpdatedUsers++;
                        console.log(`♻️  Updated user: ${userInfo.email}`);
                    } else {
                        throw error;
                    }
                }
                // Assign role to user
                try {
                    await usersService.assignRole(user.id, roleName);
                    console.log(`  👤🔗 Assigned role: ${roleName}`);
                } catch (error) {
                    if (error instanceof ConflictException || (error.message && error.message.includes('already has this role'))) {
                        // Already assigned, skip
                    } else {
                        console.error(`  ❌ Error assigning role ${roleName}:`, error.message);
                    }
                }
            } catch (error) {
                console.error(`❌ Error creating/updating user ${userData.email}:`, error.message);
            }
        }

        // 4. Assign all permissions to all super_admin users
        console.log('\n👑 Assigning all permissions to all super_admin users...');
        const allPermissions = (await permissionsService.findAll({ page: 1, limit: 1000 })).items;
        for (const userData of users.filter(u => u.roleName === 'super_admin')) {
            try {
                const user = await usersService.findByEmail(userData.email);
                for (const permission of allPermissions) {
                    try {
                        await usersService.assignPermission(user.id, permission.name);
                        console.log(`  🔑 Assigned ${permission.name} to ${user.email}`);
                    } catch (error) {
                        if (error instanceof ConflictException || (error.message && error.message.includes('already has this permission'))) {
                            // Already assigned, skip
                        } else {
                            console.error(`  ❌ Error assigning ${permission.name} to ${user.email}:`, error.message);
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Error assigning all permissions to super_admin user ${userData.email}:`, error.message);
            }
        }

        // 5. Summary
        console.log('\n🎉 Unified database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- Created/Updated ${createdOrUpdatedPermissions} permissions`);
        console.log(`- Created/Updated ${createdOrUpdatedRoles} roles with their permissions`);
        console.log(`- Created/Updated ${createdOrUpdatedUsers} users with their roles`);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();