-- In this SQL file, write (and comment!) the schema of your database, including the CREATE TABLE, CREATE INDEX, CREATE VIEW, etc. statements that compose it
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--creates person table, tracking persons
CREATE TABLE person (person_uid UUID NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        username TEXT NOT NULL,
                        pwhash TEXT NOT NULL,
                        phone_number VARCHAR(11) NOT NULL,
                        email TEXT NOT NULL,
                        school_uid UUID REFERENCES school(school_uid),
                        UNIQUE (username, phone_number, email)
                    );

--creates school table, tracking the schools that are affiliated with Red Alert
CREATE TABLE school (school_uid UUID NOT NULL PRIMARY KEY,
                        name TEXT NOT NULL,
                        address TEXT NOT NULL,
                        active BOOLEAN,
                        start_date DATE NOT NULL,
                        admin_uid UUID REFERENCES administrator(person_uid) ON DELETE CASCADE,
                        access_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
                        UNIQUE (name, address, access_token)
                    );

--creates student table, subtable of person
CREATE TABLE student (
                        PRIMARY KEY (person_uid),
                        student_id INT NOT NULL,
                        location_uid UUID REFERENCES geolocation(location_uid)
                    ) INHERITS (person);
--creates guardian table, subtable of person
CREATE TABLE guardian (
                        PRIMARY KEY (person_uid),
                        child_uid UUID REFERENCES student(person_uid),
                        affiliation TEXT NOT NULL
                    ) INHERITS (person);

--creates administrator table, subtable of person
CREATE TABLE administrator (
                        PRIMARY KEY (person_uid),
                        position TEXT NOT NULL
                    ) INHERITS (person);

--creates emergency_event table, which is the emergency events and their schools associated and their statuses
CREATE TABLE emergency_event (
                        event_uid UUID NOT NULL PRIMARY KEY,
                        school_uid UUID REFERENCES school(school_uid) ON DELETE CASCADE NOT NULL,
                        timestamp TIMESTAMP NOT NULL,
                        status BOOLEAN,
                        event_type TEXT,
                        description TEXT,
                        length INTERVAL
                    );

--condition, for a student condition
CREATE TYPE condition AS ENUM ('Safe', 'In Danger', 'Moving', 'Other');

--geolocation, tracks student geolocations for during emergencies
CREATE TABLE geolocation (
                        location_uid UUID NOT NULL PRIMARY KEY,
                        student_uid UUID REFERENCES student(person_uid) ON DELETE CASCADE,
                        timestamp TIMESTAMP NOT NULL,
                        geom GEOGRAPHY(Point, 4326),
                        status condition NOT NULL
                    );

--discussion_post, which tracks the posts, if there is a parent post, the author in person_uid
CREATE TABLE discussion_post (
                        post_uid UUID NOT NULL PRIMARY KEY,
                        parent_post_uid UUID REFERENCES discussion_post(post_uid) ON DELETE CASCADE,
                        person_uid UUID,
                        subject VARCHAR(50) NOT NULL,
                        timestamp TIMESTAMP NOT NULL,
                        type TEXT,
                        description TEXT,
                        likes INT NOT NULL,
                        dislikes INT NOT NULL,
                        verified BOOLEAN NOT NULL
                    );

--user_session, tracking every session that a user has on application
CREATE TABLE user_session (session_uid UUID NOT NULL PRIMARY KEY,
                        person_uid UUID,
                        login TIMESTAMP NOT NULL,
                        logout TIMESTAMP,
                        ip_address INET NOT NULL,
                        active BOOLEAN DEFAULT TRUE,
                        session_token TEXT NOT NULL,
                        UNIQUE (session_token)
                    );

--creation of views: virtual memory storing query definition, not improving speed or requiring more memory
--finds emergency events that are currently active
CREATE VIEW active_emergency_events AS
SELECT event_uid, school_uid, timestamp, event_type, description, length, status
FROM emergency_event WHERE status = TRUE;

--gets geolocations of students that match the current user's school
CREATE VIEW school_geolocations AS
SELECT geolocation.location_uid, timestamp, geom, status FROM geolocation
JOIN student ON student.person_uid = geolocation.student_uid
WHERE student.school_uid = current_setting('myapp.current_school_uid')::UUID;

--gets geolocations of students with status indicating they are in danger
CREATE VIEW students_in_danger AS
SELECT location_uid, student_uid, timestamp, geom, status, school_uid FROM geolocation JOIN person ON student_uid = person_uid
WHERE status = 'In Danger';

--all_persons is every person_uid
CREATE VIEW all_persons AS
SELECT person_uid FROM person
UNION
SELECT person_uid FROM student
UNION
SELECT person_uid FROM guardian
UNION
SELECT person_uid FROM administrator;


--creation of indices: structure to speed up retrieval of rows from a table
--index sorting students by school
CREATE INDEX idx_student_school_uid ON student (school_uid);
--indexsorting geolocation by school
CREATE INDEX idx_geolocation_school_uid ON geolocation (school_uid);
--index sorting students by time
CREATE INDEX idx_timestamp_geolocation ON geolocation (timestamp);
--index sorting emergency_events by time
CREATE INDEX idx_timestamp_emergency_event ON emergency_event (timestamp);
--index sorting discussion_posts by time
CREATE INDEX idx_timestamp_discussion_post ON discussion_post (timestamp);


--roles created
CREATE ROLE admin_role;
CREATE ROLE school_role;
CREATE ROLE read_only_role;
--future plans:
--CREATE ROLE school_administrator_role;
--CREATE ROLE guardian_role;

--privileges for database admin_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA PUBLIC TO admin_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA PUBLIC TO admin_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA PUBLIC TO admin_role;

--privileges for school_role
GRANT ALL PRIVILEGES ON person, student, guardian, administrator, geolocation, discussion_post TO school_role;

--privileges for read_only_role
GRANT SELECT ON ALL TABLES IN SCHEMA PUBLIC TO read_only_role;

--enabling RLS
ALTER TABLE person ENABLE ROW LEVEL SECURITY;
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrator ENABLE ROW LEVEL SECURITY;
ALTER TABLE geolocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_post ENABLE ROW LEVEL SECURITY;
--force RLS for table owner
ALTER TABLE person FORCE ROW LEVEL SECURITY;
ALTER TABLE student FORCE ROW LEVEL SECURITY;
ALTER TABLE guardian FORCE ROW LEVEL SECURITY;
ALTER TABLE administrator FORCE ROW LEVEL SECURITY;
ALTER TABLE geolocation FORCE ROW LEVEL SECURITY;
ALTER TABLE discussion_post FORCE ROW LEVEL SECURITY;

--bypasses row level security, can see all rows for all schools
ALTER ROLE admin_role BYPASSRLS;
ALTER ROLE read_only_role BYPASSRLS;


--for school_role access:
--school_role users can only access rows in student that are in their school
CREATE POLICY student_access_policy ON student FOR ALL TO school_role
 USING (school_uid = current_setting('myapp.current_school_uid')::UUID);

--school_role users can only access rows in person that are in their school
 CREATE POLICY person_access_policy ON person FOR ALL TO school_role
 USING (school_uid = current_setting('myapp.current_school_uid')::UUID);

--school_role users can only access rows in guardian that are in their school
 CREATE POLICY guardian_access_policy ON guardian FOR ALL TO school_role
 USING (school_uid = current_setting('myapp.current_school_uid')::UUID);

--school_role users can only access rows in administrator that are in their school
 CREATE POLICY administrator_access_policy ON administrator FOR ALL TO school_role
 USING (school_uid = current_setting('myapp.current_school_uid')::UUID);

--school_role users can only access rows in geolocation that are in their school
--geolocation row accessible if there exists at least one person where their uid matches this row's student_uid and the school_uid matches current setting
CREATE POLICY geolocation_access_policy ON geolocation FOR ALL TO school_role
USING (EXISTS (SELECT 1 FROM person WHERE person_uid = geolocation.student_uid AND school_uid = current_setting('myapp.current_school_uid')::UUID));

--school_role users can only access rows in discussion_post that are in their school
CREATE POLICY discussion_post_access_policy ON discussion_post FOR ALL TO school_role
USING (EXISTS(SELECT 1 FROM person WHERE person_uid = discussion_post.person_uid AND school_uid = current_setting('myapp.current_school_uid')::UUID));

--creates app_user, which all normal users will use, based off login will be granted specific role
CREATE USER app_user WITH PASSWORD 'app_password';

--function set_school_uid(school_name) used to set myapp.current_school_uid
CREATE OR REPLACE FUNCTION set_school_uid(school_name TEXT) RETURNS VOID AS $$
DECLARE
    given_school_uid UUID;
BEGIN
    SELECT school_uid INTO given_school_uid FROM school WHERE name = school_name;
    PERFORM set_config('myapp.current_school_uid', given_school_uid::text, false);
END;
$$ LANGUAGE plpgsql;

--function check_person_uid_exists() is a trigger function used to manually check foreign keys exist
CREATE OR REPLACE FUNCTION check_person_uid_exists()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM all_persons WHERE person_uid = NEW.person_uid) THEN
        RAISE EXCEPTION 'person_uid % does not exist in person, student, guardian, or administrator tables', NEW.person_uid;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--trigger checking before inserting/updating tables with foreign keys referencing persons
CREATE TRIGGER check_person_uid_before_insert_update
BEFORE INSERT OR UPDATE ON user_session
FOR EACH ROW EXECUTE FUNCTION check_person_uid_exists();

CREATE TRIGGER check_person_uid_before_insert_update
BEFORE INSERT OR UPDATE ON discussion_post
FOR EACH ROW EXECUTE FUNCTION check_person_uid_exists();


--SELECT school_uid INTO given_school_uid FROM school WHERE name = school_name;

-- --guardian_role users can only access rows in student that match their child
--  CREATE POLICY guardian_student_access_policy ON student FOR ALL AS RESTRICTIVE TO guardian_role
--  USING ((SELECT 1 FROM guardian WHERE child_uid = student.person_uid AND username = current_user));

--  --guardian_role users can only access rows in person that match their child
--  CREATE POLICY guardian_person_access_policy ON person FOR ALL AS RESTRICTIVE TO guardian_role
--  USING ((SELECT 1 FROM guardian WHERE child_uid = person.person_uid AND username = current_user));

-- --guardian_role users can only access rows in guardian that match their username
--  CREATE POLICY guardian_guardian_access_policy ON guardian FOR ALL AS RESTRICTIVE TO guardian_role
--  USING (current_user = username);

