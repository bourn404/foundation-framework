drop table if exists perms cascade;
create table perms (
id serial not null primary key
,category varchar(60)
,slug varchar(255) not null unique
,name varchar(60) not null
,description TEXT
,parent int references perms(id) on delete cascade
);

insert into perms (category, slug, name, description) values 
('Administration','manage_system_settings','Manage System Settings','User can edit API keys and other system-wide settings.'),
('Contacts','view_contacts','View Contacts','User can view the contacts list.'),
('Contacts','manage_contacts','Make/Receive Calls','User can make and receive calls through the browser interface.'),
('Contacts','make_receive_calls','Make/Receive Calls','User can make and receive calls through the browser interface.'),
('Contacts','edit_own_contact_info','Edit Own Contact Info', 'Contacts with their own accounts can modify their contact info (i.e. email, phone).'),
('Permissions','manage_groups', 'Manage Groups', 'User can create/delete user groups and assign permissions to groups.'),
('Permissions','assign_groups', 'Assign Users to Groups', 'User can edit the user group of other users.');

drop table if exists user_groups cascade;
create table user_groups (
id serial not null primary key
,name varchar(60) not null
,is_built_in boolean default false -- Prevent role from being deleted in frontend
,is_super boolean default false
,is_default boolean unique -- Default for all new accounts
);

insert into user_groups (name, is_built_in, is_super, is_default) values
('Super Admin', true, true, null), -- Has all permission because is_super
('Registered User', true, false, true); -- Default for newly registered accounts

drop table if exists user_group_perms cascade;
create table user_group_perms (
user_group_id int references user_groups(id) on delete cascade
,perm_id int references perms(id) on delete cascade
,primary key(user_group_id,perm_id)
);

drop table if exists users cascade;
create table users (
id serial not null primary key
,firstname varchar(60) not null
,lastname varchar(60) 
,user_group_id int references user_groups(id) 
,company varchar(255)
,email varchar(255)
,password varchar(255)
,phone varchar(255)
,website varchar(255)
,is_contact boolean default true
);

insert into users (firstname, lastname, user_group_id, company, email, phone, website) values 
('Carson','Fairbourn',(SELECT id FROM user_groups WHERE is_super = true),'Foundation Framework', 'bourn404@gmail.com', '385-281-3675','https://www.carsonfairbourn.com');

drop table if exists calls cascade;
create table calls (
id serial not null primary key
,uid varchar(255) not null -- twilio identifier
,status varchar(25) not null default 'ringing'
,from_number varchar(25) not null -- phone number
,from_user int references users(id)
,to_number varchar(25) not null -- phone number
,to_user int references users(id)
,duration int not null
,notes text
,recording varchar(255)
,created timestamp default CURRENT_TIMESTAMP
);
