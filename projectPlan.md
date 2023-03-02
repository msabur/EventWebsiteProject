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
		- Make events: private, RSO (if the RSO is active)
		- Send request to super-admin for making public events
		- View and act on requests
			- For people joining his RSOs
	- super admin
		- View / create universities
		- View and act on requests to make public events
		- View and act on requests to make RSOs
			- Approving sets RSO's 'approved' field to true
			- Approving also makes the requester an admin
	- student
		- View RSOs
			- Can also leave RSOs from here
		- Request to join an rso
			- Its admin chooses to accept / reject
		- Request to make an RSO
			- Requester will be admin of the new rso
			- Once 4 more students join, it becomes active
