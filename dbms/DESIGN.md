# Design Document

By Miles McDonald

Video overview: <(https://youtu.be/grkkF69_F7I)>

## Scope

In this section you should answer the following questions:

* What is the purpose of your database?
My database handles data storage, data access, and data manipulation for my startup idea, Red Alert. Red Alert is an emergency information distribution system intended for coordinating and safeguarding extreme emergency situations, such as school shootings. Red Alert will work with schools anywhere, providing them with the necessary software to be better suited and have measures in place in case such a situation occurs. For schools that already have alert systems in place, like my university, the University of Maryland, Red Alert can work on top of it due to its unique look on safeguarding school shooter situations.

When a school joins Red Alert, each student is added to the database, including their family contact information, school ID, name, username, password. Whenever an emergency situation occurs, a student can also login to the app/website and allow their location to be accessed. The database logs the students coordinates, as well as their safety condition (in danger, safe, moving) and will output all students on a map to the authorities and school officials. All information regarding students, contact info, and more will be securely stored in the database for each school.

* Which people, places, things, etc. are you including in the scope of your database?
Within the database, each school that participates in the Red Alert system will be included in the database. All proper school officials and local authorities will be connected to each school directly, as well as all the students of the school. For the schools, all that will be stored is name and location. For school officials, their name, affiliated school, role, contact information, and password will all be stored in the database. Local authorities will also have contact information, based on their proximity to the school and based on the school's discretion. For students, all of their information will be stored, as well as family contact information.

* Which people, places, things, etc. are *outside* the scope of your database?
In many ways, the local authorities (police departments and SWAT) are outside of our scope. We will have an option for local authorities to be contacted but any dispatching officers will not be tracked or have their location saved. We will allow the authorities to conduct business by their own measures.

## Functional Requirements

In this section you should answer the following questions:

* What should a user be able to do with your database?
A user should be able to access regarding Red Alert specifically. A user should be able to see how many schools are involved and how many students are involved. A proper user should also be able to modify information about students and the school, as this data is updated in real time. Students should be able to be added, contact information updated, and location updated. Schools should be able to be added, information regarding them updated, and their emergency situation updated.
* What's beyond the scope of what a user should be able to do with your database?
A user should not be able to access any private information at all, and that is an absolute necessity to the viability of the program. A student's name, school information, contact information, family status, and (most importantly) location should be hidden, unless accessed by the proper authorities in an emergency situation. Any information regarding the school should also be hidden, unless by proper authorities.

## Representation

### Entities

In this section you should answer the following questions:

* Which entities will you choose to represent in your database?
School, student, school_official, contact_info, emergency_event, location, notification, permissions, authorities
* What attributes will those entities have?
school:
 -name, address, date started, active (0,1), admin_name, admin_contact
 student:
 -name, username, password, school, phone_number, email, location, id_num
 school_official:
 -name, username, password, school_id, school role, phone number, email
 contact_info:
 -student_id, affiliation, phone_number, email
 emergency_event:
 -school_id, timestamp, type, status, description
 location:
 -student_id, longitude, latitude, address, condition

* Why did you choose the types you did?
optimizing storage space
* Why did you choose the constraints you did?

### Relationships

In this section you should include your entity relationship diagram and describe the relationships between the entities in your database.

![ER Diagram](updated_er_diagram.pdf)

Student, guardian, and administrator are all subtables, and subtypes of person. They inherit all the attributes of person. There is a many-to-one relationshi between school and person, as many persons correlate to a school, but a person can only correlate to one school. There is potentially a many-to-one relationship between emergency_event and school, if a school were to have multiple emergency events, and since an emergency event only relates to one school. there is a one-to-one relationship between geolocation and student, as one student gets a geolocation and a coordinate geolocation tracks to only one student. There is a many-to-one relationship between person and user_session, as a user_session maps to only one person, but a person can have many sessions. there is a many-to-one relationship between person and discussion post, as there is one author of a discussion post, but one author can have mutliple posts. There is a many-to-one relationship between a post and parent_post, as one parent can have many replies, but a reply can only have one parent.

## Optimizations

In this section you should answer the following questions:

* Which optimizations (e.g., indexes, views) did you create? Why?

I created two views and five indexes and indicies. The views store queries that will be oft-searched. active_emergency_events tracks emergency events that are ongoing, denoted by a TRUE status. Administrators will often search this to oversee active emergencies. school_geolocations gets geolocation data for schools that match the current users' school. idx_student_school_uid, idx_geolocation_school_uid, idx_timestamp_geolocation, idx_timestamp_emergency_event, idx_timestamp_discussion_post.

The index idx_student_school_uid sorts students by their school_uid column. The index idx_geolocation_school_uid sorts students by their school_uid column. These indices improve query times, working with the Row Level Security policies that are simple enough. The index idx_timestamp_geolocation sorts geolocations by timestamp, or when their geolocation is updated. The index idx_timestamp_emergency_event sorts emergency_events by timestamp as well, and same with idx_timestamp_discussion_post.

## Limitations

In this section you should answer the following questions:

* What are the limitations of your design?
This design may be limited in its speed of access of data, due to the row level security policies needed. users must only be able to access data from their school, and the application will handle further security measures, but this requires every row to be queried. While the use of indices improves this, it still could be limited on a large dataset.
* What might your database not be able to represent very well?
My database currently does not represent the roles of distinct users well enough yet. It allows further implementation for parents and school administrators, but their current access is limited.
