-- public.events definition

-- Drop table

-- DROP TABLE events;

CREATE TABLE events (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	email_address text NOT NULL,
	category text NOT NULL,
	phone_number text NOT NULL,
	description text NOT NULL,
	start_time timestamptz NOT NULL,
	event_name text NOT NULL,
	location_name text NOT NULL,
	location_latitude text NOT NULL,
	location_longitude text NOT NULL,
	end_time timestamptz NOT NULL,
	location_radius_m int8 NOT NULL DEFAULT '15'::bigint,
	CONSTRAINT events_pkey PRIMARY KEY (id)
);


-- public.universities definition

-- Drop table

-- DROP TABLE universities;

CREATE TABLE universities (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	"name" text NOT NULL,
	"location" text NOT NULL,
	description text NOT NULL,
	num_students int8 NOT NULL,
	CONSTRAINT universities_name_key UNIQUE (name),
	CONSTRAINT universities_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE users;

CREATE TABLE users (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	pass_hash text NOT NULL,
	email text NOT NULL,
	username text NOT NULL,
	CONSTRAINT "User_pkey" PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username)
);


-- public."comments" definition

-- Drop table

-- DROP TABLE "comments";

CREATE TABLE "comments" (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	"text" text NOT NULL,
	author_id int8 NOT NULL,
	event_id int8 NOT NULL,
	CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
	CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT feedbacks_author_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
	CONSTRAINT feedbacks_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);


-- public.private_events definition

-- Drop table

-- DROP TABLE private_events;

CREATE TABLE private_events (
	id int8 NOT NULL,
	host_university_id int8 NOT NULL,
	CONSTRAINT private_events_pkey PRIMARY KEY (id),
	CONSTRAINT private_events_host_university_id_fkey FOREIGN KEY (host_university_id) REFERENCES universities(id) ON DELETE CASCADE,
	CONSTRAINT private_events_id_fkey FOREIGN KEY (id) REFERENCES events(id) ON DELETE CASCADE
);


-- public.public_events definition

-- Drop table

-- DROP TABLE public_events;

CREATE TABLE public_events (
	id int8 NOT NULL,
	is_approved bool NOT NULL DEFAULT false,
	CONSTRAINT public_events_pkey PRIMARY KEY (id),
	CONSTRAINT public_events_id_fkey FOREIGN KEY (id) REFERENCES events(id) ON DELETE CASCADE
);


-- public.ratings definition

-- Drop table

-- DROP TABLE ratings;

CREATE TABLE ratings (
	stars int8 NOT NULL,
	user_id int8 NOT NULL,
	event_id int8 NOT NULL,
	CONSTRAINT ratings_pkey PRIMARY KEY (user_id, event_id),
	CONSTRAINT ratings_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
	CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);


-- public.students definition

-- Drop table

-- DROP TABLE students;

CREATE TABLE students (
	id int8 NOT NULL,
	university_id int8 NOT NULL,
	CONSTRAINT students_pkey PRIMARY KEY (id),
	CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT students_university_id_fkey FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
);


-- public.super_admins definition

-- Drop table

-- DROP TABLE super_admins;

CREATE TABLE super_admins (
	id int8 NOT NULL,
	CONSTRAINT super_admins_pkey PRIMARY KEY (id),
	CONSTRAINT super_admins_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);


-- public.admins definition

-- Drop table

-- DROP TABLE admins;

CREATE TABLE admins (
	id int8 NOT NULL,
	CONSTRAINT admins_pkey PRIMARY KEY (id),
	CONSTRAINT admins_id_fkey FOREIGN KEY (id) REFERENCES students(id) ON DELETE CASCADE
);


-- public.rsos definition

-- Drop table

-- DROP TABLE rsos;

CREATE TABLE rsos (
	id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	"name" text NOT NULL,
	owner_id int8 NOT NULL,
	is_active bool NOT NULL DEFAULT false,
	is_approved bool NOT NULL DEFAULT false,
	CONSTRAINT "RSOs_pkey" PRIMARY KEY (id),
	CONSTRAINT rsos_name_key UNIQUE (name),
	CONSTRAINT rsos_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES students(id) ON DELETE CASCADE
);


-- public.rso_events definition

-- Drop table

-- DROP TABLE rso_events;

CREATE TABLE rso_events (
	id int8 NOT NULL,
	host_rso_id int8 NOT NULL,
	CONSTRAINT "RSO_events_pkey" PRIMARY KEY (id),
	CONSTRAINT rso_events_host_rso_id_fkey FOREIGN KEY (host_rso_id) REFERENCES rsos(id) ON DELETE CASCADE,
	CONSTRAINT rso_events_id_fkey FOREIGN KEY (id) REFERENCES events(id) ON DELETE CASCADE
);


-- public.rso_memberships definition

-- Drop table

-- DROP TABLE rso_memberships;

CREATE TABLE rso_memberships (
	user_id int4 NOT NULL,
	rso_id int4 NOT NULL,
	is_approved bool NOT NULL DEFAULT false,
	CONSTRAINT rso_memberships_pkey PRIMARY KEY (user_id, rso_id),
	CONSTRAINT rso_memberships_rso_id_fkey FOREIGN KEY (rso_id) REFERENCES rsos(id) ON DELETE CASCADE,
	CONSTRAINT rso_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Functions (triggers may depend on these)

CREATE OR REPLACE FUNCTION public.check_rso_active()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF (SELECT COUNT(*) FROM rso_memberships WHERE rso_id = NEW.rso_id AND is_approved = true) > 4 THEN
        UPDATE rsos SET is_active = true WHERE id = NEW.rso_id;
    ELSE
        UPDATE rsos SET is_active = false WHERE id = NEW.rso_id;
    END IF;
    RETURN NEW;
END;
$function$
;

-- Table Triggers

create trigger check_rso_active_trigger after
insert
    or
delete
    or
update
    on
    public.rso_memberships for each row execute function check_rso_active();

-- public.events_view source

CREATE OR REPLACE VIEW events_view
AS SELECT events.id,
    events.email_address,
    events.category,
    events.phone_number,
    events.description,
    events.start_time,
    events.event_name,
    events.location_name,
    events.location_latitude,
    events.location_longitude,
    events.end_time,
    events.location_radius_m,
    public_events.is_approved,
    private_events.host_university_id,
    rso_events.host_rso_id,
        CASE
            WHEN private_events.host_university_id IS NOT NULL THEN 'private'::text
            WHEN rso_events.host_rso_id IS NOT NULL THEN 'rso'::text
            ELSE 'public'::text
        END AS type
   FROM events
     LEFT JOIN public_events USING (id)
     LEFT JOIN private_events USING (id)
     LEFT JOIN rso_events USING (id)
  WHERE public_events.is_approved = true OR public_events.is_approved IS NULL;