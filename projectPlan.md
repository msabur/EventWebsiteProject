# Architecture

- vite frontend: simple static React frontend. like create-react-app but faster in development
- fastify.js backend, hosted (run locally during development)
- postgresSQL database, hosted on Supabase

# Design of frontend

- Navigation: events view, control panel
	- homepage is the events view

- events view - all roles
	- list of events
		- superadmins see ALL events
		- students/admins see what they can see
			- public
			- private at their uni
			- RSO events at their RSOs
	- click on an item to see details
		- comments, ratings, location on map, ...
		- edit own comments and ratings

- control panel - all roles
	- admin
		- Make events: private, RSO
		- Send request to super-admin for public
	- super admin
		- View / create / delete universities
		- View and act on requests
			- For RSOs and public events
	- student
		- View RSOs and choose one to join
		- Can't leave RSO b/c that would be tough
			- Need to reassign admin, etc
