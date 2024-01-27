# backendTicketingSystem
NodeJS server on EC2 to handle ticketing for a bus company.
Designed flow of the node server:
![image](https://github.com/Manasamahesh/backendTicketingSystem/assets/25504822/dccb34cd-20f5-4282-b8f0-8667a7292cad)



# Important Points

* The ticket number consists of eight digits and is randomly generated. Therefore, when making Postman calls request such as fetchTicketStatus, fetchPassengerDetails and UpdateTicketStatus, sample data to be updated with new ticket number generated at the time of calling ticket creation endpoint when testing the above mentioned requests.
* Only admin users are allowed to reset tickets for the server reset endpoint. Therefore, I have added the eligible users to the adminConfigJson file.
* As part of the ticket system status is maintained, which have field as open,closed to represent ticket is open state and close state respectively.


   -  For creating new ticket - createnewTickets Request -> passenger Details is required
   -  For updating tickets - three forms which status only update, status and passengerDetails update, passengerDetails update -> ticketnumber is mandatory in all fields 
   -  For viewing the ticket status - Fetch ticket status -> ticketnumber and email id is mandatory fields
   -  For viewing the open tickets - Fetch open tickets - there is no mandatory fields
   -  For viewing the closed tickets - Fetch closed tickets - there is no mandatory fields
   -  For viewing the passengerDetails - Fetch passenger Details - ticket number is mandatory fields
   -  For resting the tickets status to open - reset the server - there is no mandatory fields



   
