# backendTicketingSystem
NodeJS server on EC2 to handle ticketing for a bus company.
Designed flow of the node server:
![image](https://github.com/Manasamahesh/backendTicketingSystem/assets/25504822/dccb34cd-20f5-4282-b8f0-8667a7292cad)



# Important Points to be noted

* The ticket number consists of eight digits and is randomly generated. Therefore, when making Postman calls request such as fetchTicketStatus, fetchPassengerDetails and UpdateTicketStatus, sample data to be updated with new ticket number generated at the time of calling ticket creation endpoint when testing the above mentioned requests.
* Only admin users are allowed to reset tickets for the server reset endpoint. Therefore, I have added the eligible users to the adminConfigJson file.
* As part of the ticket system status is maintained, which have field as open,closed to represent ticket is open state and close state respectively.

   
