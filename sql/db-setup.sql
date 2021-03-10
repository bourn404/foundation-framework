drop table if exists perms;
create table perms (
id serial not null primary key
,slug varchar(255) not null unique
,name varchar(60) not null
,description TEXT
);

insert into perms (slug, name, description) values 
('view-admin','View Admin Dashboard','User can access the administrator dashboard.'),
('edit-own-account','Edit Own Account', 'User can modify their own account info (i.e. name, email, phone)'),
('edit-any-account', 'Edit Any Account', 'User can modify account info for any user accounts');

drop table if exists user_groups;
create table perm_groups (
id serial not null primary key
,name varchar(60) not null
,is_built_in boolean default false -- Prevent role from being deleted in frontend
,is_super boolean default false
,is_default boolean unique -- Default for all new accounts
);

drop table if exists user_group_perms;
create table user_group_perms (
user_group_id int(11) references user_groups(id) on delete cascade
,perm_id int(11) references perms(id) on delete cascade
,primary key(user_group_id,perm_id)
)

