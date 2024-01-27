# backendTicketingSystem
NodeJS server on EC2 to handle ticketing for a bus company.
Designed flow of the node server:
![image](https://github.com/Manasamahesh/backendTicketingSystem/assets/25504822/766ee9c2-f56d-4e10-8539-a56bbd1c7d2a)


# Important Points to be noted

1.The ticket number consists of eight digits and is randomly generated. Therefore, when making Postman calls request such as fetchTicketStatus, fetchPassengerDetails and UpdateTicketStatus, sample data to be updated with new ticket number generated at the time of calling ticket creation endpoint when testing the above mentioned requests.
2. For Server reset endpoint only allowed admin user can do reset of the tickets, so those elgibile users I have add into the adminConfigJson file.

   
