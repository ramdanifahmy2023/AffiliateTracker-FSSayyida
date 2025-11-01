import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { supabase, formatDate, handleSupabaseError } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle, Calendar, Timer, MapPin } from 'lucide-react';
import { format, parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Database } from '../../types/database';

type Attendance = Database['public']['Tables']['attendance']['Row'];

interface AttendanceWithDuration extends Attendance {
  duration?: string;
}

export default function Absensi() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithDuration[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadAttendanceRecords();
    loadTodayAttendance();
    
    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadAttendanceRecords = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .order('attendance_date', { ascending: false })
      .limit(30);

    if (error) {
      toast.error('Gagal memuat riwayat absensi: ' + handleSupabaseError(error));
    } else {
      // Calculate duration for each record
      const recordsWithDuration = data.map(record => {
        let duration = '-';
        if (record.check_in_time && record.check_out_time) {
          const checkIn = parseISO(record.check_in_time);
          const checkOut = parseISO(record.check_out_time);
          const hours = differenceInHours(checkOut, checkIn);
          const minutes = differenceInMinutes(checkOut, checkIn) % 60;
          duration = `${hours}j ${minutes}m`;
        }
        return { ...record, duration };
      });
      setAttendanceRecords(recordsWithDuration);
    }
  };

  const loadTodayAttendance = async () => {
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', user.id)
      .eq('attendance_date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error loading today attendance:', error);
    } else {
      setTodayAttendance(data);
    }
  };

  const handleCheckIn = async () => {
    if (!user || todayAttendance?.check_in_time) return;

    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('attendance')
        .insert({
          user_id: user.id,
          attendance_date: today,
          check_in_time: now
        });

      if (error) throw error;

      toast.success('Check-in berhasil!');
      loadTodayAttendance();
      loadAttendanceRecords();
    } catch (error: any) {
      toast.error('Check-in gagal: ' + handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !todayAttendance || todayAttendance.check_out_time) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('attendance')
        .update({ check_out_time: now })
        .eq('id', todayAttendance.id);

      if (error) throw error;

      toast.success('Check-out berhasil!');
      loadTodayAttendance();
      loadAttendanceRecords();
    } catch (error: any) {
      toast.error('Check-out gagal: ' + handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (record: Attendance) => {
    if (!record.check_in_time) return { status: 'Tidak Hadir', color: 'bg-red-100 text-red-800' };
    if (!record.check_out_time) return { status: 'Sedang Bekerja', color: 'bg-blue-100 text-blue-800' };
    return { status: 'Selesai', color: 'bg-green-100 text-green-800' };
  };

  const getCurrentWorkDuration = () => {
    if (!todayAttendance?.check_in_time || todayAttendance.check_out_time) {
      return '-';
    }

    const checkIn = parseISO(todayAttendance.check_in_time);
    const now = currentTime;
    const hours = differenceInHours(now, checkIn);
    const minutes = differenceInMinutes(now, checkIn) % 60;
    return `${hours}j ${minutes}m`;
  };

  const isLateCheckIn = (checkInTime: string) => {
    const checkIn = parseISO(checkInTime);
    const checkInHour = checkIn.getHours();
    return checkInHour >= 9; // Late if check-in after 9 AM
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Absensi</h2>
          <p className="text-muted-foreground">Sistem absensi karyawan</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in/Check-out Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Absensi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAttendance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Check-in</div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(todayAttendance.check_in_time), 'HH:mm')}
                        {isLateCheckIn(todayAttendance.check_in_time) && (
                          <Badge variant="destructive" className="ml-2">Terlambat</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {todayAttendance.check_out_time ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Check-out</div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(todayAttendance.check_out_time), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert>
                      <Timer className="w-4 h-4" />
                      <AlertDescription>
                        Anda sedang bekerja selama: <strong>{getCurrentWorkDuration()}</strong>
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={handleCheckOut} 
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Check-out
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <Calendar className="w-4 h-4" />
                  <AlertDescription>
                    Anda belum check-in hari ini. Silakan check-in untuk memulai kerja.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleCheckIn} 
                  disabled={loading}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check-in
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Ringkasan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {todayAttendance?.check_in_time ? 
                      format(parseISO(todayAttendance.check_in_time), 'HH:mm') : '-'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Check-in</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {todayAttendance?.check_out_time ? 
                      format(parseISO(todayAttendance.check_out_time), 'HH:mm') : '-'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Check-out</div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-700">
                  {todayAttendance?.check_out_time ? 
                    attendanceRecords[0]?.duration || '-' : 
                    getCurrentWorkDuration()
                  }
                </div>
                <div className="text-sm text-blue-600">Total Durasi Kerja</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada riwayat absensi
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map((record) => {
                    const statusInfo = getAttendanceStatus(record);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.attendance_date)}</TableCell>
                        <TableCell>
                          {record.check_in_time ? (
                            <div className="flex items-center gap-2">
                              {format(parseISO(record.check_in_time), 'HH:mm')}
                              {isLateCheckIn(record.check_in_time) && (
                                <Badge variant="destructive" className="text-xs">Terlambat</Badge>
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {record.check_out_time ? 
                            format(parseISO(record.check_out_time), 'HH:mm') : '-'
                          }
                        </TableCell>
                        <TableCell>{record.duration}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color} variant="secondary">
                            {statusInfo.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}