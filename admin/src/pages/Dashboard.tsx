
import { createSignal, createEffect, onCleanup } from "solid-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/registry/ui/card";
import { Button } from "~/registry/ui/button";
import { TextField } from "~/registry/ui/text-field";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "~/registry/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "~/registry/ui/dialog";

import { AddLocation, UpdateLocation, DeleteLocation, GetLocations, Location } from '../utils/fetch';

export default function LocationManager() {
  const [locations, setLocations] = createSignal<Location[]>([]);
  const [showAddDialog, setShowAddDialog] = createSignal(false);
  const [showUpdateDialog, setShowUpdateDialog] = createSignal(false);
  const [selectedLocation, setSelectedLocation] = createSignal<Location | null>(null);
  const [newLocation, setNewLocation] = createSignal<Location>({
    id: '',
    names: [],
    lati: 0,
    long: 0
  });

  // Fetch locations when the component is mounted
  createEffect(() => {
    async function fetchLocations() {
      try {
        const data = await GetLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }

    fetchLocations();
    onCleanup(() => {});

  });

  const handleAddLocation = async () => {
    await AddLocation(newLocation());
    setShowAddDialog(false);
    await refreshLocations();
  };

  const handleUpdateLocation = async () => {
    if (selectedLocation()) {
      await UpdateLocation(selectedLocation()!);
      setShowUpdateDialog(false);
      await refreshLocations();
    }
  };

  const handleDeleteLocation = async (id: string) => {
    await DeleteLocation(id);
    await refreshLocations();
  };

  const refreshLocations = async () => {
    try {
      const data = await GetLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  return (
    <>
      {/* List Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>Manage your locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations().map((location) => (
                <TableRow>
                  <TableCell>{location.names.join(", ")}</TableCell>
                  <TableCell>{location.lati}</TableCell>
                  <TableCell>{location.long}</TableCell>
                  <TableCell>
                    <Button onClick={() => {
                      setSelectedLocation(location);
                      setShowUpdateDialog(true);
                    }}>Edit</Button>
                    <Button onClick={() => handleDeleteLocation(location.id)} color="red">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Location Dialog */}
      <Dialog open={showAddDialog()} onClose={() => setShowAddDialog(false)}>
        <DialogTrigger asChild>
          <Button onClick={() => setShowAddDialog(true)}>Add Location</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <h3>Add New Location</h3>
          </DialogHeader>
          <div>
            <TextField label="Location Name" onInput={(e) => setNewLocation({ ...newLocation(), names: [e.target.value] })} />
            <TextField label="Latitude" type="number" onInput={(e) => setNewLocation({ ...newLocation(), lati: parseFloat(e.target.value) })} />
            <TextField label="Longitude" type="number" onInput={(e) => setNewLocation({ ...newLocation(), long: parseFloat(e.target.value) })} />
          </div>
          <DialogFooter>
            <Button onClick={handleAddLocation}>Add</Button>
            <Button onClick={() => setShowAddDialog(false)} color="secondary">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Location Dialog */}
      <Dialog open={showUpdateDialog()} onClose={() => setShowUpdateDialog(false)}>
        <DialogTrigger asChild>
          <Button onClick={() => setShowUpdateDialog(true)}>Update Location</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <h3>Update Location</h3>
          </DialogHeader>
          {selectedLocation() && (
            <>
              <TextField
                label="Location Name"
                value={selectedLocation()?.names.join(", ")}
                onInput={(e) => setSelectedLocation({ ...selectedLocation()!, names: [e.target.value] })}
              />
              <TextField
                label="Latitude"
                type="number"
                value={selectedLocation()?.lati || 0}
                onInput={(e) => setSelectedLocation({ ...selectedLocation()!, lati: parseFloat(e.target.value) })}
              />
              <TextField
                label="Longitude"
                type="number"
                value={selectedLocation()?.long || 0}
                onInput={(e) => setSelectedLocation({ ...selectedLocation()!, long: parseFloat(e.target.value) })}
              />
            </>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateLocation}>Update</Button>
            <Button onClick={() => setShowUpdateDialog(false)} color="secondary">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

